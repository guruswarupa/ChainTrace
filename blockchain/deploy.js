
const { Web3 } = require('web3');
const fs = require('fs');
const solc = require('solc');

async function deployContract() {
  try {
    // Connect to Ganache
    const web3Provider = process.env.WEB3_PROVIDER || 'http://localhost:8545';
    const web3 = new Web3(web3Provider);
    
    // Test connection
    const networkId = await web3.eth.net.getId();
    console.log('Connected to network ID:', networkId);
    
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
    
    console.log('Compiling contract...');
    const compiled = JSON.parse(solc.compile(JSON.stringify(input)));
    
    // Check for compilation errors
    if (compiled.errors) {
      compiled.errors.forEach(error => {
        console.error('Compilation error:', error.formattedMessage);
      });
      if (compiled.errors.some(error => error.severity === 'error')) {
        throw new Error('Contract compilation failed');
      }
    }
    
    const contract = compiled.contracts['SupplyChain.sol']['SupplyChain'];
    
    if (!contract) {
      throw new Error('Contract not found in compilation output');
    }
    
    // Get accounts
    const accounts = await web3.eth.getAccounts();
    console.log('Using account:', accounts[0]);
    
    // Get gas price for legacy transaction
    const gasPrice = await web3.eth.getGasPrice();
    console.log('Gas price:', gasPrice);
    
    // Estimate gas
    const contractInstance = new web3.eth.Contract(contract.abi);
    const deployData = contractInstance.deploy({
      data: '0x' + contract.evm.bytecode.object,
    });
    
    const gasEstimate = await deployData.estimateGas({
      from: accounts[0]
    });
    console.log('Estimated gas:', gasEstimate);
    
    // Deploy the contract
    console.log('Deploying contract...');
    const deployedContract = await deployData.send({
      from: accounts[0],
      gas: Number(gasEstimate) + Math.ceil(Number(gasEstimate) * 0.2), // Add 20% buffer
      gasPrice: Number(gasPrice),
    });
    
    console.log('Contract deployed to address:', deployedContract.options.address);
    console.log('ABI:', JSON.stringify(contract.abi, null, 2));
    
    // Save contract address and ABI for use in API
    const contractInfo = {
      address: deployedContract.options.address,
      abi: contract.abi
    };
    
    fs.writeFileSync('./contract-info.json', JSON.stringify(contractInfo, null, 2));
    console.log('Contract info saved to contract-info.json');
    
    return deployedContract;
    
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

deployContract();
