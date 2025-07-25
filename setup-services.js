
const oracledb = require('oracledb');
const Minio = require('minio');
const { Web3 } = require('web3');
const fs = require('fs');

// Configuration
const dbConfig = {
  user: 'SYSTEM',
  password: 'oracle',
  connectString: 'localhost:1521/FREE'
};

const minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'minioadmin',
  secretKey: 'minioadmin'
});

const web3 = new Web3('http://localhost:8545');

async function setupOracle() {
  console.log('🔧 Setting up Oracle Database...');
  let connection;
  try {
    // Wait for connection
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    connection = await oracledb.getConnection(dbConfig);
    console.log('✅ Connected to Oracle DB');

    // Create tables
    const tables = [
      `CREATE TABLE suppliers (
        supplier_id NUMBER PRIMARY KEY,
        name VARCHAR2(255),
        location VARCHAR2(255)
      )`,
      `CREATE TABLE transporters (
        transporter_id NUMBER PRIMARY KEY,
        name VARCHAR2(255),
        vehicle_no VARCHAR2(100)
      )`,
      `CREATE TABLE products (
        product_id NUMBER PRIMARY KEY,
        name VARCHAR2(255),
        category VARCHAR2(100)
      )`,
      `CREATE TABLE shipments (
        shipment_id VARCHAR2(50) PRIMARY KEY,
        product_id NUMBER,
        supplier_id NUMBER,
        transporter_id NUMBER,
        origin VARCHAR2(255),
        destination VARCHAR2(255),
        timestamp DATE,
        status VARCHAR2(50),
        blockchain_hash VARCHAR2(255)
      )`
    ];

    for (const tableSQL of tables) {
      try {
        await connection.execute(tableSQL);
        console.log(`✅ Created table: ${tableSQL.split(' ')[2]}`);
      } catch (error) {
        if (error.message.includes('ORA-00955')) {
          console.log(`ℹ️  Table ${tableSQL.split(' ')[2]} already exists`);
        } else {
          console.error(`❌ Error creating table: ${error.message}`);
        }
      }
    }

    // Insert sample data
    const sampleData = [
      {
        table: 'suppliers',
        data: [
          [1, 'Fresh Farms Co.', 'California, USA'],
          [2, 'Tech Components Ltd.', 'Shenzhen, China'],
          [3, 'Global Textiles Inc.', 'Bangladesh']
        ]
      },
      {
        table: 'transporters',
        data: [
          [1, 'FastTrack Logistics', 'TRK-001'],
          [2, 'Ocean Freight Co.', 'SHP-202'],
          [3, 'Air Cargo Express', 'AIR-303']
        ]
      },
      {
        table: 'products',
        data: [
          [1, 'Organic Apples', 'Food'],
          [2, 'Smartphone Components', 'Electronics'],
          [3, 'Cotton T-Shirts', 'Clothing']
        ]
      }
    ];

    for (const { table, data } of sampleData) {
      for (const row of data) {
        try {
          if (table === 'suppliers') {
            await connection.execute(
              'INSERT INTO suppliers (supplier_id, name, location) VALUES (:1, :2, :3)',
              row
            );
          } else if (table === 'transporters') {
            await connection.execute(
              'INSERT INTO transporters (transporter_id, name, vehicle_no) VALUES (:1, :2, :3)',
              row
            );
          } else if (table === 'products') {
            await connection.execute(
              'INSERT INTO products (product_id, name, category) VALUES (:1, :2, :3)',
              row
            );
          }
        } catch (error) {
          if (!error.message.includes('ORA-00001')) {
            console.error(`❌ Error inserting data: ${error.message}`);
          }
        }
      }
    }

    await connection.commit();
    console.log('✅ Oracle Database setup complete');
  } catch (error) {
    console.error('❌ Oracle setup failed:', error.message);
  } finally {
    if (connection) await connection.close();
  }
}

async function setupMinIO() {
  console.log('🔧 Setting up MinIO...');
  try {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const bucketName = 'supply-chain-docs';
    const bucketExists = await minioClient.bucketExists(bucketName);
    
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log('✅ Created MinIO bucket: supply-chain-docs');
    } else {
      console.log('ℹ️  MinIO bucket already exists');
    }
    
    console.log('✅ MinIO setup complete');
  } catch (error) {
    console.error('❌ MinIO setup failed:', error.message);
  }
}

async function setupBlockchain() {
  console.log('🔧 Setting up Blockchain...');
  try {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const accounts = await web3.eth.getAccounts();
    console.log('✅ Connected to Ganache');
    console.log(`ℹ️  Available accounts: ${accounts.length}`);
    
    // You would deploy the smart contract here
    console.log('⚠️  Smart contract deployment requires manual step');
    console.log('ℹ️  Run: cd blockchain && node deploy.js');
    
  } catch (error) {
    console.error('❌ Blockchain setup failed:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting service setup...\n');
  
  await setupOracle();
  console.log('');
  
  await setupMinIO();
  console.log('');
  
  await setupBlockchain();
  console.log('');
  
  console.log('🎉 Setup complete!');
  console.log('\nNext steps:');
  console.log('1. Deploy smart contract: cd blockchain && node deploy.js');
  console.log('2. Update contract address in shipment-api/index.js');
  console.log('3. Start the API: cd shipment-api && node index.js');
}

main().catch(console.error);
