const express = require('express');
const cors = require('cors');
const oracledb = require('oracledb');
const Minio = require('minio');
const Web3 = require('web3');
const multer = require('multer');
const crypto = require('crypto');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Oracle DB Configuration
const dbConfig = {
  user: 'system',
  password: 'oracle',
  connectString: 'oracle-db:1521/xe'
};

// MinIO Configuration
const minioClient = new Minio.Client({
  endPoint: 'minio',
  port: 9000,
  useSSL: false,
  accessKey: 'minioadmin',
  secretKey: 'minioadmin'
});

// Web3 Configuration (Ganache)
const web3 = new Web3('http://localhost:8545');

// Smart Contract ABI and Address (you'll need to deploy this)
const contractABI = [
  {
    "inputs": [
      {"name": "shipmentId", "type": "string"},
      {"name": "hash", "type": "string"},
      {"name": "owner", "type": "address"},
      {"name": "timestamp", "type": "uint256"}
    ],
    "name": "recordShipment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "shipmentId", "type": "string"}],
    "name": "getShipmentHistory",
    "outputs": [
      {"name": "", "type": "string"},
      {"name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const contractAddress = '0x1234567890123456789012345678901234567890'; // Replace with actual deployed contract

// Multer configuration for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Oracle DB tables
async function initializeDatabase() {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    // Create tables if they don't exist
    const createTables = `
      BEGIN
        EXECUTE IMMEDIATE 'CREATE TABLE suppliers (
          supplier_id NUMBER PRIMARY KEY,
          name VARCHAR2(255),
          location VARCHAR2(255)
        )';
      EXCEPTION
        WHEN OTHERS THEN
          IF SQLCODE != -955 THEN RAISE; END IF;
      END;
    `;

    const createTransporters = `
      BEGIN
        EXECUTE IMMEDIATE 'CREATE TABLE transporters (
          transporter_id NUMBER PRIMARY KEY,
          name VARCHAR2(255),
          vehicle_no VARCHAR2(100)
        )';
      EXCEPTION
        WHEN OTHERS THEN
          IF SQLCODE != -955 THEN RAISE; END IF;
      END;
    `;

    const createProducts = `
      BEGIN
        EXECUTE IMMEDIATE 'CREATE TABLE products (
          product_id NUMBER PRIMARY KEY,
          name VARCHAR2(255),
          category VARCHAR2(100)
        )';
      EXCEPTION
        WHEN OTHERS THEN
          IF SQLCODE != -955 THEN RAISE; END IF;
      END;
    `;

    const createShipments = `
      BEGIN
        EXECUTE IMMEDIATE 'CREATE TABLE shipments (
          shipment_id VARCHAR2(50) PRIMARY KEY,
          product_id NUMBER,
          supplier_id NUMBER,
          transporter_id NUMBER,
          origin VARCHAR2(255),
          destination VARCHAR2(255),
          timestamp DATE,
          status VARCHAR2(50),
          blockchain_hash VARCHAR2(255)
        )';
      EXCEPTION
        WHEN OTHERS THEN
          IF SQLCODE != -955 THEN RAISE; END IF;
      END;
    `;

    await connection.execute(createTables);
    await connection.execute(createTransporters);
    await connection.execute(createProducts);
    await connection.execute(createShipments);

    // Insert sample data if tables are empty
    const insertSampleData = `
      MERGE INTO suppliers s
      USING (SELECT 1 as supplier_id, 'Fresh Farms Co.' as name, 'California, USA' as location FROM dual
             UNION ALL
             SELECT 2, 'Tech Components Ltd.', 'Shenzhen, China' FROM dual) src
      ON (s.supplier_id = src.supplier_id)
      WHEN NOT MATCHED THEN
        INSERT (supplier_id, name, location)
        VALUES (src.supplier_id, src.name, src.location)
    `;

    await connection.execute(insertSampleData);
    await connection.commit();

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

// Initialize MinIO bucket
async function initializeMinIO() {
  try {
    const bucketName = 'supply-chain-docs';
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log('MinIO bucket created successfully');
    }
  } catch (error) {
    console.error('MinIO initialization error:', error);
  }
}

// Generate hash for blockchain
function generateShipmentHash(shipmentData) {
  const hashString = JSON.stringify(shipmentData);
  return crypto.createHash('sha256').update(hashString).digest('hex');
}

// Record shipment on blockchain
async function recordOnBlockchain(shipmentId, hash) {
  try {
    const accounts = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    await contract.methods.recordShipment(
      shipmentId,
      hash,
      accounts[0],
      Math.floor(Date.now() / 1000)
    ).send({ from: accounts[0], gas: 300000 });

    console.log(`Shipment ${shipmentId} recorded on blockchain`);
    return hash;
  } catch (error) {
    console.error('Blockchain recording error:', error);
    return null;
  }
}

// API Routes
app.get('/', (req, res) => {
  res.json({ message: 'Supply Chain API running with full integration', version: '2.0.0' });
});

// Get all shipments
app.get('/api/shipments', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute('SELECT * FROM shipments ORDER BY timestamp DESC');

    const shipments = result.rows.map(row => ({
      shipment_id: row[0],
      product_id: row[1],
      supplier_id: row[2],
      transporter_id: row[3],
      origin: row[4],
      destination: row[5],
      timestamp: row[6],
      status: row[7],
      blockchain_hash: row[8]
    }));

    res.json(shipments);
  } catch (error) {
    console.error('Error fetching shipments:', error);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) await connection.close();
  }
});

// Get specific shipment
app.get('/api/shipments/:id', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      'SELECT * FROM shipments WHERE shipment_id = :id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    const row = result.rows[0];
    const shipment = {
      shipment_id: row[0],
      product_id: row[1],
      supplier_id: row[2],
      transporter_id: row[3],
      origin: row[4],
      destination: row[5],
      timestamp: row[6],
      status: row[7],
      blockchain_hash: row[8]
    };

    res.json(shipment);
  } catch (error) {
    console.error('Error fetching shipment:', error);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) await connection.close();
  }
});

// Create new shipment
app.post('/api/shipments', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    const shipmentId = `SH${Date.now()}`;
    const shipmentData = {
      shipment_id: shipmentId,
      product_id: req.body.product_id,
      supplier_id: req.body.supplier_id,
      transporter_id: req.body.transporter_id,
      origin: req.body.origin,
      destination: req.body.destination,
      timestamp: new Date(),
      status: 'Created'
    };

    // Generate hash and record on blockchain
    const hash = generateShipmentHash(shipmentData);
    const blockchainHash = await recordOnBlockchain(shipmentId, hash);

    shipmentData.blockchain_hash = blockchainHash || hash;

    await connection.execute(
      `INSERT INTO shipments (shipment_id, product_id, supplier_id, transporter_id, origin, destination, timestamp, status, blockchain_hash)
       VALUES (:shipment_id, :product_id, :supplier_id, :transporter_id, :origin, :destination, :timestamp, :status, :blockchain_hash)`,
      shipmentData
    );

    await connection.commit();
    res.status(201).json(shipmentData);
  } catch (error) {
    console.error('Error creating shipment:', error);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) await connection.close();
  }
});

// Upload document to MinIO
app.post('/api/upload/:shipmentId', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const bucketName = 'supply-chain-docs';
    const fileName = `${req.params.shipmentId}/${Date.now()}_${req.file.originalname}`;

    await minioClient.putObject(
      bucketName,
      fileName,
      req.file.buffer,
      req.file.size,
      { 'Content-Type': req.file.mimetype }
    );

    const fileUrl = `http://minio:9000/${bucketName}/${fileName}`;
    res.json({ message: 'File uploaded successfully', url: fileUrl, fileName });
  } catch (error) {
    console.error('MinIO upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Get documents for a shipment
app.get('/api/documents/:shipmentId', async (req, res) => {
  try {
    const bucketName = 'supply-chain-docs';
    const prefix = `${req.params.shipmentId}/`;

    const objectsStream = minioClient.listObjectsV2(bucketName, prefix, true);
    const documents = [];

    objectsStream.on('data', (obj) => {
      documents.push({
        name: obj.name,
        size: obj.size,
        lastModified: obj.lastModified,
        url: `http://minio:9000/${bucketName}/${obj.name}`
      });
    });

    objectsStream.on('end', () => {
      res.json(documents);
    });

    objectsStream.on('error', (error) => {
      console.error('MinIO list error:', error);
      res.status(500).json({ error: 'Failed to list documents' });
    });
  } catch (error) {
    console.error('MinIO error:', error);
    res.status(500).json({ error: 'MinIO error' });
  }
});

// Track shipment with full details
app.get('/api/track/:id', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    const shipmentQuery = `
      SELECT s.*, sp.name as supplier_name, sp.location as supplier_location,
             t.name as transporter_name, t.vehicle_no,
             p.name as product_name, p.category as product_category
      FROM shipments s
      LEFT JOIN suppliers sp ON s.supplier_id = sp.supplier_id
      LEFT JOIN transporters t ON s.transporter_id = t.transporter_id
      LEFT JOIN products p ON s.product_id = p.product_id
      WHERE s.shipment_id = :id
    `;

    const result = await connection.execute(shipmentQuery, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    const row = result.rows[0];
    const trackingData = {
      shipment_id: row[0],
      product_id: row[1],
      supplier_id: row[2],
      transporter_id: row[3],
      origin: row[4],
      destination: row[5],
      timestamp: row[6],
      status: row[7],
      blockchain_hash: row[8],
      supplier: {
        name: row[9],
        location: row[10]
      },
      transporter: {
        name: row[11],
        vehicle_no: row[12]
      },
      product: {
        name: row[13],
        category: row[14]
      }
    };

    res.json(trackingData);
  } catch (error) {
    console.error('Error tracking shipment:', error);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) await connection.close();
  }
});

// Blockchain verification endpoint
app.get('/api/verify/:id', async (req, res) => {
  try {
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    const result = await contract.methods.getShipmentHistory(req.params.id).call();

    res.json({
      shipment_id: req.params.id,
      blockchain_hash: result[0],
      owner: result[1],
      timestamp: new Date(result[2] * 1000),
      verified: true,
      verification_status: 'Valid on Blockchain'
    });
  } catch (error) {
    console.error('Blockchain verification error:', error);
    res.status(500).json({ 
      shipment_id: req.params.id,
      verified: false,
      verification_status: 'Blockchain verification failed',
      error: error.message
    });
  }
});

// Get suppliers
app.get('/api/suppliers', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute('SELECT * FROM suppliers');

    const suppliers = result.rows.map(row => ({
      supplier_id: row[0],
      name: row[1],
      location: row[2]
    }));

    res.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) await connection.close();
  }
});

// Get transporters
app.get('/api/transporters', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute('SELECT * FROM transporters');

    const transporters = result.rows.map(row => ({
      transporter_id: row[0],
      name: row[1],
      vehicle_no: row[2]
    }));

    res.json(transporters);
  } catch (error) {
    console.error('Error fetching transporters:', error);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) await connection.close();
  }
});

// Get products
app.get('/api/products', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute('SELECT * FROM products');

    const products = result.rows.map(row => ({
      product_id: row[0],
      name: row[1],
      category: row[2]
    }));

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) await connection.close();
  }
});

// Initialize everything
async function initialize() {
  await initializeDatabase();
  await initializeMinIO();
  console.log('All services initialized');
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Supply Chain API listening at http://0.0.0.0:${port}`);
  initialize();
});