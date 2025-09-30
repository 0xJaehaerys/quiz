const { ethers } = require('hardhat');
require('dotenv').config();

async function main() {
  console.log('🚀 Deploying QuizResultNFT to Base...');

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log('📝 Deploying with account:', deployer.address);
  console.log('💰 Account balance:', (await deployer.getBalance()).toString());

  // Deploy QuizResultNFT contract
  console.log('📦 Deploying QuizResultNFT...');
  const QuizResultNFT = await ethers.getContractFactory('QuizResultNFT');
  
  const quizNFT = await QuizResultNFT.deploy();
  await quizNFT.waitForDeployment();

  const address = await quizNFT.getAddress();
  console.log('✅ QuizResultNFT deployed to:', address);

  // Verification info
  console.log('\n📋 Deployment Summary:');
  console.log('='.repeat(50));
  console.log('Contract: QuizResultNFT');
  console.log('Address:', address);
  console.log('Network:', hre.network.name);
  console.log('Deployer:', deployer.address);
  console.log('='.repeat(50));

  // Save deployment info to a JSON file
  const fs = require('fs');
  const path = require('path');
  
  const deploymentTx = quizNFT.deploymentTransaction();
  
  const deploymentInfo = {
    contract: 'QuizResultNFT',
    address: address,
    network: hre.network.name,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    blockNumber: deploymentTx?.blockNumber,
    transactionHash: deploymentTx?.hash
  };

  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `quiz-nft-${hre.network.name}.json`;
  fs.writeFileSync(
    path.join(deploymentsDir, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log(`📄 Deployment info saved to: deployments/${filename}`);

  // Test basic functionality
  console.log('\n🧪 Testing basic contract functions...');
  
  const tokenName = await quizNFT.name();
  const tokenSymbol = await quizNFT.symbol();
  const totalSupply = await quizNFT.totalSupply();

  console.log('Token Name:', tokenName);
  console.log('Token Symbol:', tokenSymbol);
  console.log('Total Supply:', totalSupply.toString());

  console.log('✅ Basic contract functionality verified!');

  // Environment variable instructions
  console.log('\n📝 Next Steps:');
  console.log('='.repeat(50));
  console.log('1. Add this address to your environment variables:');
  if (hre.network.name === 'base') {
    console.log(`   NEXT_PUBLIC_QUIZ_NFT_BASE_ADDRESS=${address}`);
  } else if (hre.network.name === 'baseSepolia') {
    console.log(`   NEXT_PUBLIC_QUIZ_NFT_SEPOLIA_ADDRESS=${address}`);
  } else {
    console.log(`   NEXT_PUBLIC_QUIZ_NFT_${hre.network.name.toUpperCase()}_ADDRESS=${address}`);
  }
  
  console.log('\n2. Verify contract on Basescan:');
  console.log(`   npx hardhat verify --network ${hre.network.name} ${address}`);
  
  console.log('\n3. Test NFT minting:');
  console.log('   - Complete a quiz in your app');
  console.log('   - Try minting an NFT certificate');
  console.log('   - Check your wallet for the new NFT');

  console.log('\n🎉 Deployment completed successfully!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
