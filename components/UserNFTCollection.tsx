'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  ExternalLink, 
  Loader2, 
  Sparkles, 
  Clock, 
  Target,
  Calendar,
  Award
} from 'lucide-react'
import { 
  checkFarcasterWalletConnection,
  getBaseExplorerUrl,
  QUIZ_NFT_ABI,
  getQuizNFTAddress
} from '@/lib/farcaster-transactions'
import { useContractReads } from 'wagmi'
import { formatTime } from '@/lib/utils'
import { base, baseSepolia } from 'viem/chains'

interface QuizNFTData {
  tokenId: string
  quizTitle: string
  quizId: string
  score: number
  timeSpent: number
  totalQuestions: number
  correctAnswers: number
  completedAt: number
  difficulty: string
  category: string
}

interface UserNFTCollectionProps {
  userAddress?: string
  className?: string
}

export function UserNFTCollection({ userAddress, className }: UserNFTCollectionProps) {
  const [walletStatus, setWalletStatus] = useState<{ address?: string; chainId?: number }>({})
  const [nftData, setNftData] = useState<QuizNFTData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use provided address or detect from wallet
  const targetAddress = userAddress || walletStatus.address
  const targetChain = process.env.NODE_ENV === 'production' ? base : baseSepolia
  const contractAddress = getQuizNFTAddress(targetChain.id)

  // Check wallet connection on mount
  useEffect(() => {
    if (!userAddress) {
      checkWalletConnection()
    }
  }, [userAddress])

  const checkWalletConnection = async () => {
    try {
      const status = await checkFarcasterWalletConnection()
      setWalletStatus({
        address: status.address,
        chainId: status.chainId
      })
    } catch (error) {
      console.error('Failed to check wallet:', error)
    }
  }

  // Use wagmi to read contract data
  const { data: contractData, isError, isLoading: contractLoading } = useContractReads({
    contracts: targetAddress && contractAddress ? [
      {
        address: contractAddress as `0x${string}`,
        abi: QUIZ_NFT_ABI,
        functionName: 'getTokensByOwner',
        args: [targetAddress as `0x${string}`]
      }
    ] : []
  })

  const fetchUserNFTs = useCallback(async () => {
    if (!targetAddress || !contractAddress) return

    setIsLoading(true)
    setError(null)

    try {
      // If we have contract data from wagmi, process it
      if (contractData && contractData[0]?.result) {
        const tokenIds = contractData[0].result as bigint[]
        
        if (tokenIds.length > 0) {
          // Fetch details for each token
          const nfts: QuizNFTData[] = []
          
          // For now, we'll show a simplified view
          // In a full implementation, you'd fetch individual token data
          tokenIds.forEach((tokenId, index) => {
            nfts.push({
              tokenId: tokenId.toString(),
              quizTitle: `Quiz Certificate #${tokenId}`,
              quizId: `quiz-${tokenId}`,
              score: 85 + (index * 5) % 15, // Mock data
              timeSpent: 120 + (index * 30),
              totalQuestions: 10,
              correctAnswers: Math.floor((85 + (index * 5) % 15) / 10),
              completedAt: Date.now() - (index * 24 * 60 * 60 * 1000),
              difficulty: ['easy', 'medium', 'hard'][index % 3],
              category: ['Cryptocurrency', 'Web3', 'NFTs'][index % 3]
            })
          })

          setNftData(nfts)
        } else {
          setNftData([])
        }
      }
    } catch (error) {
      console.error('Error fetching NFTs:', error)
      setError('Failed to load NFT collection')
    } finally {
      setIsLoading(false)
    }
  }, [targetAddress, contractAddress, contractData])

  // Fetch NFTs when address is available
  useEffect(() => {
    if (targetAddress && contractAddress) {
      fetchUserNFTs()
    }
  }, [targetAddress, contractAddress, fetchUserNFTs])

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-accent'
    if (score >= 70) return 'text-blue-400'
    return 'text-orange-400'
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'success'
      case 'medium': return 'default'
      case 'hard': return 'destructive'
      default: return 'secondary'
    }
  }

  if (!targetAddress) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <Award className="w-12 h-12 mx-auto mb-4 text-muted" />
          <h3 className="font-semibold mb-2">NFT Collection</h3>
          <p className="text-sm text-muted">
            Connect your wallet to view your quiz achievement NFTs
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading || contractLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-accent" />
            Your Quiz Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || isError) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-accent" />
            Your Quiz Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted mb-4">{error || 'Failed to load NFTs'}</p>
            <Button onClick={fetchUserNFTs} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (nftData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-accent" />
            Your Quiz Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted" />
            <h3 className="font-semibold mb-2">No Achievement NFTs Yet</h3>
            <p className="text-sm text-muted mb-4">
              Complete quizzes and mint NFT certificates to build your collection!
            </p>
            <Button 
              onClick={() => window.location.href = '/farcaster/quizzes'}
              variant="accent"
            >
              <Target className="w-4 h-4 mr-2" />
              Start Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-accent" />
            Your Quiz Achievements
          </div>
          <Badge variant="accent" className="text-xs">
            {nftData.length} NFT{nftData.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {nftData.map((nft) => (
            <Card key={nft.tokenId} className="border-border hover:border-accent/50 transition-colors">
              <CardContent className="p-4">
                {/* NFT Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {nft.quizTitle}
                    </h4>
                    <p className="text-xs text-muted">#{nft.tokenId}</p>
                  </div>
                  <Badge 
                    variant={getDifficultyColor(nft.difficulty)}
                    className="text-xs shrink-0 ml-2"
                  >
                    {nft.difficulty}
                  </Badge>
                </div>

                {/* Score Display */}
                <div className="text-center mb-3">
                  <div className={`text-3xl font-bold ${getScoreColor(nft.score)}`}>
                    {nft.score}%
                  </div>
                  <p className="text-xs text-muted">
                    {nft.correctAnswers}/{nft.totalQuestions} correct
                  </p>
                </div>

                {/* Metadata */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-muted">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(nft.timeSpent)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(nft.completedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted">
                    <Award className="w-3 h-3" />
                    <span className="truncate">{nft.category}</span>
                  </div>
                </div>

                {/* View on Explorer */}
                <div className="mt-4 pt-3 border-t border-border">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full h-8 text-xs"
                  >
                    <a
                      href={`${getBaseExplorerUrl('', targetChain.id).replace('/tx/', '/token/')}${contractAddress}?a=${nft.tokenId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-3 h-3 mr-2" />
                      View NFT
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Collection Stats */}
        {nftData.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-accent">
                  {Math.round(nftData.reduce((acc, nft) => acc + nft.score, 0) / nftData.length)}%
                </p>
                <p className="text-xs text-muted">Avg Score</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  {nftData.reduce((acc, nft) => acc + nft.correctAnswers, 0)}
                </p>
                <p className="text-xs text-muted">Total Correct</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  {formatTime(nftData.reduce((acc, nft) => acc + nft.timeSpent, 0))}
                </p>
                <p className="text-xs text-muted">Total Time</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default UserNFTCollection
