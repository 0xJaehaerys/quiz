# 🌐 Web3 + NFT Integration Setup

Этот документ описывает как настроить Web3 интеграцию с Base network для минта NFT сертификатов за прохождение квизов.

## 🚀 Quick Start

### 1. Environment Variables

Добавьте следующие переменные в ваш `.env.local`:

```bash
# Web3 & Base Network
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id_here
NEXT_PUBLIC_QUIZ_NFT_BASE_ADDRESS=0x...     # После деплоя на Base Mainnet
NEXT_PUBLIC_QUIZ_NFT_SEPOLIA_ADDRESS=0x...  # После деплоя на Base Sepolia

# Base Network RPC (опционально, есть дефолтные)
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Для деплоя контрактов
PRIVATE_KEY=your_private_key_for_deployment
BASESCAN_API_KEY=your_basescan_api_key_for_verification
```

### 2. WalletConnect Project ID

1. Перейдите на [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Создайте новый проект
3. Скопируйте Project ID в `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`

### 3. Deploy NFT Contract

#### Deploy на Base Sepolia (для тестирования):
```bash
npm run deploy:base-sepolia
```

#### Deploy на Base Mainnet (для продакшена):
```bash
npm run deploy:base
```

После успешного деплоя:
1. Добавьте адрес контракта в environment variables
2. Обновите `.env.local` с новым адресом
3. Верифицируйте контракт на Basescan (опционально)

### 4. Verify Contract (опционально)
```bash
# Для Base Sepolia
npm run verify:base-sepolia 0xYourContractAddress

# Для Base Mainnet  
npm run verify:base 0xYourContractAddress
```

---

## 🏗️ Architecture Overview

### Web3 Stack:
- **wagmi**: React hooks для Ethereum
- **viem**: TypeScript Ethereum library
- **RainbowKit**: Wallet connection UI
- **Base Network**: L2 для низких fees

### NFT Contract Features:
- **On-chain metadata**: SVG + JSON metadata хранится on-chain
- **Quiz result data**: Score, время, сложность embedded в NFT
- **Beautiful certificates**: Динамическая генерация SVG на основе результатов
- **Gas optimization**: Эффективные функции для минимизации costs

### Farcaster Integration:
- **Mini App transactions**: Mint NFT прямо в Farcaster через SDK
- **Seamless UX**: Автоматическое переключение на Base network
- **Wallet connection**: Через Farcaster встроенный wallet

---

## 🎮 User Flow

### 1. Complete Quiz
```typescript
// Пользователь завершает квиз
const result = {
  score: 85,
  timeSpent: 120,
  correctAnswers: 17,
  totalQuestions: 20
}
```

### 2. Connect Wallet (Farcaster)
```typescript
// QuizCompletionNFT автоматически проверяет подключение
const walletStatus = await checkFarcasterWalletConnection()

if (!walletStatus.isConnected) {
  // Показывает кнопку "Connect Wallet"
  await connectWalletInFarcaster()
}
```

### 3. Switch to Base Network
```typescript
// Автоматическое переключение на Base
if (!walletStatus.isCorrectNetwork) {
  await switchToBaseNetwork(targetChain.id)
}
```

### 4. Mint NFT Certificate
```typescript
// Mint происходит через Farcaster SDK
const mintResult = await mintQuizResultNFT(
  userAddress,
  {
    quizId: quiz.id,
    quizTitle: quiz.title,
    score: result.score,
    // ... other quiz data
  },
  baseChainId
)

if (mintResult.success) {
  // Показываем success UI с transaction hash
  console.log('NFT minted!', mintResult.hash)
}
```

### 5. View NFT Collection
```typescript
// UserNFTCollection показывает все NFTs пользователя
const userNFTs = await getUserNFTsByAddress(userAddress)
```

---

## 🎨 NFT Certificate Design

### Dynamic SVG Generation
Каждый NFT сертификат генерируется динамически на основе результатов квиза:

```solidity
function _generateSVG(uint256 tokenId) private view returns (string memory) {
    QuizResult memory result = quizResults[tokenId];
    
    // Цвет зависит от score
    string memory scoreColor = result.score >= 90 ? "#00d0c7" : // Excellent
                               result.score >= 70 ? "#3b82f6" : // Good
                               "#ef4444"; // Needs improvement
    
    // Генерация SVG с quiz data
    return generateCertificateSVG(result, scoreColor);
}
```

### Metadata Structure
```json
{
  "name": "Quiz Certificate #123",
  "description": "Certificate for completing Crypto Basics with a score of 85%",
  "image": "data:image/svg+xml;base64,<base64_svg>",
  "attributes": [
    {"trait_type": "Score", "value": 85, "max_value": 100},
    {"trait_type": "Time Spent", "value": 120},
    {"trait_type": "Difficulty", "value": "medium"},
    {"trait_type": "Category", "value": "Cryptocurrency"}
  ]
}
```

---

## 🔧 Development

### Testing Locally
1. Запустите local hardhat node:
```bash
npx hardhat node
```

2. Deploy контракт локально:
```bash
npx hardhat run scripts/deploy-nft-base.js --network localhost
```

3. Обновите environment variables с local адресом
4. Тестируйте mint functionality в приложении

### Contract Compilation
```bash
npm run compile
```

### Run Tests
```bash
npm run test:contracts
```

---

## 📊 Gas Costs (Base Network)

| Operation | Estimated Gas | Cost (~$0.001/gas) |
|-----------|---------------|---------------------|
| Deploy Contract | ~2,500,000 | ~$2.50 |
| Mint NFT | ~200,000 | ~$0.20 |
| Transfer NFT | ~50,000 | ~$0.05 |

*Base network обеспечивает значительно более низкие costs по сравнению с Ethereum mainnet*

---

## 🔐 Security Considerations

### Smart Contract
- ✅ OpenZeppelin contracts используются для security
- ✅ Access control с Ownable pattern
- ✅ Input validation на все параметры
- ✅ Reentrancy protection встроена в OpenZeppelin

### Frontend
- ✅ Environment variables для sensitive data
- ✅ Client-side validation перед transactions
- ✅ Error handling для failed transactions
- ✅ Network verification перед operations

### API Security
- ✅ Rate limiting через middleware
- ✅ CORS настройки для Farcaster domains
- ✅ Input validation с Zod schemas

---

## 🚨 Troubleshooting

### Common Issues:

#### "Contract not deployed"
- Проверьте что контракт deploy был successful
- Убедитесь что правильный адрес в environment variables
- Check что используете правильную network (mainnet vs testnet)

#### "Wallet connection failed"
- Убедитесь что приложение запущено в Farcaster environment
- Проверьте что Farcaster SDK correctly инициализован
- Check console для detailed error messages

#### "Transaction failed"
- Убедитесь что wallet подключен к правильной network
- Проверьте что достаточно ETH для gas fees
- Verify что contract address корректный

#### "Network switch failed"  
- Check что target network правильно configured в кошельке
- Некоторые кошельки могут блокировать automatic network switching
- Try manual network switch в кошельке

---

## 🎯 Next Steps

После успешного setup:

1. **Test end-to-end flow**: Complete quiz → Connect wallet → Mint NFT
2. **Monitor gas costs**: Track actual costs на Base network
3. **User feedback**: Собирайте feedback от пользователей
4. **Optimize UX**: Improve error messages и loading states
5. **Scale**: Consider additional features like NFT marketplace integration

---

## 📚 Resources

- [Base Network Docs](https://docs.base.org/)
- [wagmi Documentation](https://wagmi.sh/)  
- [RainbowKit Docs](https://www.rainbowkit.com/)
- [Farcaster Mini Apps](https://docs.farcaster.xyz/developers/guides/mini-apps)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

---

🎉 **Ready to mint some quiz certificates!** 🎉
