import { getFarcasterSDK } from '@/lib/fc'
import { encodeFunctionData, parseUnits } from 'viem'
import { base, baseSepolia } from 'viem/chains'

// Contract ABI for quiz result minting
export const QUIZ_NFT_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'quizTitle', type: 'string' },
      { name: 'quizId', type: 'string' },
      { name: 'score', type: 'uint256' },
      { name: 'timeSpent', type: 'uint256' },
      { name: 'totalQuestions', type: 'uint256' },
      { name: 'correctAnswers', type: 'uint256' },
      { name: 'difficulty', type: 'string' },
      { name: 'category', type: 'string' }
    ],
    name: 'mintQuizResult',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getQuizResult',
    outputs: [
      {
        components: [
          { name: 'quizTitle', type: 'string' },
          { name: 'quizId', type: 'string' },
          { name: 'score', type: 'uint256' },
          { name: 'timeSpent', type: 'uint256' },
          { name: 'totalQuestions', type: 'uint256' },
          { name: 'correctAnswers', type: 'uint256' },
          { name: 'completedAt', type: 'uint256' },
          { name: 'player', type: 'address' },
          { name: 'difficulty', type: 'string' },
          { name: 'category', type: 'string' }
        ],
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'getTokensByOwner',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

// Contract addresses (to be set after deployment)
export const QUIZ_NFT_ADDRESSES = {
  [base.id]: process.env.NEXT_PUBLIC_QUIZ_NFT_BASE_ADDRESS || '',
  [baseSepolia.id]: process.env.NEXT_PUBLIC_QUIZ_NFT_SEPOLIA_ADDRESS || ''
} as const

// Get contract address for current network
export function getQuizNFTAddress(chainId: number): string {
  const address = QUIZ_NFT_ADDRESSES[chainId as keyof typeof QUIZ_NFT_ADDRESSES]
  if (!address) {
    console.warn(`No quiz NFT contract address configured for chain ${chainId}`)
    return ''
  }
  return address
}

// Types for quiz completion
export interface QuizCompletionData {
  quizId: string
  quizTitle: string
  score: number
  timeSpent: number
  totalQuestions: number
  correctAnswers: number
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
}

export interface FarcasterTransactionResult {
  success: boolean
  hash?: string
  error?: string
}

/**
 * Connect wallet through Farcaster Mini App
 */
export async function connectWalletInFarcaster(): Promise<{ address?: string; error?: string }> {
  try {
    const sdk = getFarcasterSDK()
    if (!sdk) {
      throw new Error('Farcaster SDK not available')
    }

    console.log('🔗 Requesting wallet connection via Farcaster...')
    
    // Use Farcaster's wallet connection
    const result = await sdk.wallet.requestAccounts()
    
    if (result && result.length > 0) {
      const address = result[0]
      console.log('✅ Wallet connected:', address)
      return { address }
    } else {
      throw new Error('No accounts returned')
    }
  } catch (error) {
    console.error('❌ Wallet connection failed:', error)
    return { error: `Failed to connect wallet: ${error}` }
  }
}

/**
 * Execute transaction through Farcaster Mini App
 */
export async function executeFarcasterTransaction(
  to: string,
  data: string,
  chainId: number = base.id
): Promise<FarcasterTransactionResult> {
  try {
    const sdk = getFarcasterSDK()
    if (!sdk) {
      throw new Error('Farcaster SDK not available')
    }

    console.log('📝 Executing transaction via Farcaster...', {
      to,
      chainId,
      dataLength: data.length
    })

    // Prepare transaction request
    const transactionRequest = {
      to: to as `0x${string}`,
      data: data as `0x${string}`,
      value: '0x0', // No ETH being sent
      chainId: `0x${chainId.toString(16)}` // Convert to hex string
    }

    // Execute transaction through Farcaster
    const result = await sdk.wallet.sendTransaction(transactionRequest)
    
    if (result) {
      console.log('✅ Transaction sent successfully:', result)
      return {
        success: true,
        hash: result
      }
    } else {
      throw new Error('Transaction failed - no result returned')
    }
  } catch (error) {
    console.error('❌ Transaction execution failed:', error)
    return {
      success: false,
      error: `Transaction failed: ${error}`
    }
  }
}

/**
 * Mint quiz result NFT through Farcaster
 */
export async function mintQuizResultNFT(
  playerAddress: string,
  quizData: QuizCompletionData,
  chainId: number = base.id
): Promise<FarcasterTransactionResult> {
  try {
    const contractAddress = getQuizNFTAddress(chainId)
    if (!contractAddress) {
      throw new Error('Quiz NFT contract not deployed on this network')
    }

    console.log('🎨 Minting quiz result NFT...', {
      quiz: quizData.quizTitle,
      score: quizData.score,
      player: playerAddress
    })

    // Encode function call
    const data = encodeFunctionData({
      abi: QUIZ_NFT_ABI,
      functionName: 'mintQuizResult',
      args: [
        playerAddress as `0x${string}`,
        quizData.quizTitle,
        quizData.quizId,
        BigInt(quizData.score),
        BigInt(quizData.timeSpent),
        BigInt(quizData.totalQuestions),
        BigInt(quizData.correctAnswers),
        quizData.difficulty,
        quizData.category
      ]
    })

    // Execute transaction
    const result = await executeFarcasterTransaction(contractAddress, data, chainId)
    
    if (result.success) {
      console.log('🎉 Quiz NFT minted successfully!', result.hash)
    }

    return result
  } catch (error) {
    console.error('❌ NFT minting failed:', error)
    return {
      success: false,
      error: `NFT minting failed: ${error}`
    }
  }
}

/**
 * Check if user has wallet connected in Farcaster
 */
export async function checkFarcasterWalletConnection(): Promise<{ 
  isConnected: boolean
  address?: string
  chainId?: number
  error?: string 
}> {
  try {
    const sdk = getFarcasterSDK()
    if (!sdk) {
      return { isConnected: false, error: 'Farcaster SDK not available' }
    }

    // Try to get current accounts
    const accounts = await sdk.wallet.requestAccounts()
    
    if (accounts && accounts.length > 0) {
      // Get current chain ID
      const chainId = await sdk.wallet.request({
        method: 'eth_chainId'
      })

      return {
        isConnected: true,
        address: accounts[0],
        chainId: parseInt(chainId, 16)
      }
    } else {
      return { isConnected: false }
    }
  } catch (error) {
    console.error('Error checking wallet connection:', error)
    return { 
      isConnected: false, 
      error: `Failed to check connection: ${error}` 
    }
  }
}

/**
 * Switch to Base network in Farcaster wallet
 */
export async function switchToBaseNetwork(chainId: number = base.id): Promise<boolean> {
  try {
    const sdk = getFarcasterSDK()
    if (!sdk) {
      throw new Error('Farcaster SDK not available')
    }

    const targetChain = chainId === base.id ? base : baseSepolia

    // Request network switch
    await sdk.wallet.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }]
    })

    console.log(`✅ Switched to ${targetChain.name} network`)
    return true
  } catch (error: any) {
    // If network doesn't exist, try to add it
    if (error.code === 4902) {
      return addBaseNetwork(chainId)
    }
    
    console.error('❌ Failed to switch network:', error)
    return false
  }
}

/**
 * Add Base network to Farcaster wallet
 */
export async function addBaseNetwork(chainId: number = base.id): Promise<boolean> {
  try {
    const sdk = getFarcasterSDK()
    if (!sdk) {
      throw new Error('Farcaster SDK not available')
    }

    const targetChain = chainId === base.id ? base : baseSepolia
    
    await sdk.wallet.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: `0x${chainId.toString(16)}`,
          chainName: targetChain.name,
          nativeCurrency: targetChain.nativeCurrency,
          rpcUrls: [targetChain.rpcUrls.default.http[0]],
          blockExplorerUrls: targetChain.blockExplorers
            ? [targetChain.blockExplorers.default.url]
            : undefined
        }
      ]
    })

    console.log(`✅ Added ${targetChain.name} network`)
    return true
  } catch (error) {
    console.error('❌ Failed to add network:', error)
    return false
  }
}

/**
 * Get Base network explorer URL for transaction
 */
export function getBaseExplorerUrl(hash: string, chainId: number = base.id): string {
  if (chainId === base.id) {
    return `https://basescan.org/tx/${hash}`
  } else {
    return `https://sepolia.basescan.org/tx/${hash}`
  }
}

/**
 * Format transaction hash for display
 */
export function formatTxHash(hash: string): string {
  if (!hash) return ''
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}
