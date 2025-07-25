const Web3 = require('web3');
const fs = require('fs');
const solc = require('solc');

async function deployContract() {
  // Connect to Ganache
  const web3 = new Web3('http://localhost:8545');
  
  // Read the contract source code
  const contractSource = fs.readFileSync('./SupplyChain.sol', 'utf8');
  
  // Compile the contract
  const input = {
    language: 'Solidity',
    sources: {
      'SupplyChain.sol': {
        content: contractSource,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*'],
        },
      },
    },
  };
  
  const compiled = JSON.parse(solc.compile(JSON.stringify(input)));
  const contract = compiled.contracts['SupplyChain.sol']['SupplyChain'];
  
  // Get accounts
  const accounts = await web3.eth.getAccounts();
  
  // Deploy the contract
  const deployedContract = await new web3.eth.Contract(contract.abi)
    .deploy({
      data: contract.evm.bytecode.object,
    })
    .send({
      from: accounts[0],
      gas: 3000000,
    });
  
  console.log('Contract deployed to address:', deployedContract.options.address);
  console.log('ABI:', JSON.stringify(contract.abi, null, 2));
  
  // Save contract address and ABI for use in API
  const contractInfo = {
    address: deployedContract.options.address,
    abi: contract.abi
  };
  
  fs.writeFileSync('./contract-info.json', JSON.stringify(contractInfo, null, 2));
  
  return deployedContract;
}

deployContract().catch(console.error);
