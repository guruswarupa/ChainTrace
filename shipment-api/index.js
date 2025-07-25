// /home/msgs/ChainTrace/shipment-api/index.js

const express = require('express');
const app = express();
const port = 5000;

app.get('/', (req, res) => {
  res.send('Shipment API running');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
