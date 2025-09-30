'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/useToast'
import { 
  Sparkles, 
  Loader2, 
  ExternalLink, 
  Wallet, 
  CheckCircle, 
  AlertCircle,
  Trophy,
  Clock,
  Target
} from 'lucide-react'
import { 
  mintQuizResultNFT, 
  checkFarcasterWalletConnection, 
  connectWalletInFarcaster,
  switchToBaseNetwork,
  getBaseExplorerUrl,
  formatTxHash,
  type QuizCompletionData
} from '@/lib/farcaster-transactions'
import { Quiz, QuizResult } from '@/types'
import { formatTime } from '@/lib/utils'
import { base, baseSepolia } from 'viem/chains'

interface QuizCompletionNFTProps {
  quiz: Quiz
  result: QuizResult
  onClose?: () => void
}

interface WalletStatus {
  isConnected: boolean
  address?: string
  chainId?: number
  isCorrectNetwork?: boolean
}

export function QuizCompletionNFT({ quiz, result, onClose }: QuizCompletionNFTProps) {
  const { toast } = useToast()
  const [walletStatus, setWalletStatus] = useState<WalletStatus>({ isConnected: false })
  const [isMinting, setIsMinting] = useState(false)
  const [mintSuccess, setMintSuccess] = useState<{ hash: string; tokenId?: number } | null>(null)
  const [checkingWallet, setCheckingWallet] = useState(true)

  // Target chain (use Base mainnet in production, sepolia for testing)
  const targetChain = process.env.NODE_ENV === 'production' ? base : baseSepolia

  const checkWalletStatus = useCallback(async () => {
    setCheckingWallet(true)
    try {
      const status = await checkFarcasterWalletConnection()
      
      setWalletStatus({
        isConnected: status.isConnected,
        address: status.address,
        chainId: status.chainId,
        isCorrectNetwork: status.chainId === targetChain.id
      })

      if (status.error) {
        console.warn('Wallet check warning:', status.error)
      }
    } catch (error) {
      console.error('Failed to check wallet status:', error)
    } finally {
      setCheckingWallet(false)
    }
  }, [targetChain.id])

  useEffect(() => {
    checkWalletStatus()
  }, [checkWalletStatus])

  const handleConnectWallet = async () => {
    try {
      const result = await connectWalletInFarcaster()
      
      if (result.address) {
        toast({
          title: "Wallet Connected! 🎉",
          description: `Connected to ${result.address.slice(0, 6)}...${result.address.slice(-4)}`
        })
        await checkWalletStatus()
      } else {
        toast({
          title: "Connection Failed",
          description: result.error || "Failed to connect wallet",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to connect wallet through Farcaster",
        variant: "destructive"
      })
    }
  }

  const handleSwitchNetwork = async () => {
    try {
      const switched = await switchToBaseNetwork(targetChain.id)
      
      if (switched) {
        toast({
          title: "Network Switched! ⚡",
          description: `Switched to ${targetChain.name}`
        })
        await checkWalletStatus()
      } else {
        toast({
          title: "Network Switch Failed",
          description: `Failed to switch to ${targetChain.name}`,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Failed to switch network",
        variant: "destructive"
      })
    }
  }

  const handleMintNFT = async () => {
    if (!walletStatus.address) return

    setIsMinting(true)
    try {
      const quizData: QuizCompletionData = {
        quizId: quiz.id,
        quizTitle: quiz.title,
        score: result.score,
        timeSpent: result.timeSpent,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        difficulty: quiz.difficulty,
        category: quiz.category
      }

      console.log('🎨 Starting NFT mint...', quizData)

      const mintResult = await mintQuizResultNFT(
        walletStatus.address,
        quizData,
        targetChain.id
      )

      if (mintResult.success && mintResult.hash) {
        setMintSuccess({ hash: mintResult.hash })
        toast({
          title: "NFT Minted Successfully! 🎉",
          description: "Your quiz certificate has been minted on Base"
        })
      } else {
        throw new Error(mintResult.error || 'Minting failed')
      }
    } catch (error) {
      console.error('NFT minting error:', error)
      toast({
        title: "Minting Failed",
        description: `Failed to mint NFT: ${error}`,
        variant: "destructive"
      })
    } finally {
      setIsMinting(false)
    }
  }

  // Score-based styling
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-accent'
    if (score >= 70) return 'text-blue-400'
    return 'text-orange-400'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { variant: 'success' as const, label: 'Excellent!' }
    if (score >= 70) return { variant: 'default' as const, label: 'Good Job!' }
    return { variant: 'secondary' as const, label: 'Keep Practicing!' }
  }

  if (checkingWallet) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-accent" />
          <p className="text-muted">Checking wallet status...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-accent/20">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 animate-fade-in">
          <Trophy className="w-8 h-8 text-accent" strokeWidth={1.5} />
        </div>
        
        <CardTitle className="text-2xl text-foreground">Quiz Complete!</CardTitle>
        <CardDescription className="text-base">
          Great work on completing &quot;{quiz.title}&quot;
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quiz Results */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-panel rounded-2xl">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
              {result.score}%
            </div>
            <p className="text-xs text-muted">Score</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              {result.correctAnswers}/{result.totalQuestions}
            </div>
            <p className="text-xs text-muted">Correct</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {formatTime(result.timeSpent)}
            </div>
            <p className="text-xs text-muted">Time</p>
          </div>
        </div>

        <div className="flex justify-center">
          <Badge {...getScoreBadge(result.score)}>
            {getScoreBadge(result.score).label}
          </Badge>
        </div>

        {/* NFT Minting Section */}
        {!mintSuccess ? (
          <div className="border border-accent/20 rounded-xl p-4 bg-accent/5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-foreground">Mint Achievement NFT</h3>
            </div>
            
            <p className="text-sm text-muted mb-4">
              Save this quiz result as a collectible NFT certificate on Base Network
            </p>

            {/* Wallet Status */}
            <div className="space-y-3">
              {!walletStatus.isConnected ? (
                <Button 
                  onClick={handleConnectWallet}
                  variant="outline"
                  className="w-full"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              ) : !walletStatus.isCorrectNetwork ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-orange-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>Switch to {targetChain.name} network</span>
                  </div>
                  <Button 
                    onClick={handleSwitchNetwork}
                    variant="outline"
                    className="w-full"
                  >
                    Switch to {targetChain.name}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-accent">
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      Connected to {walletStatus.address?.slice(0, 6)}...{walletStatus.address?.slice(-4)}
                    </span>
                  </div>
                  
                  <Button 
                    onClick={handleMintNFT}
                    disabled={isMinting}
                    variant="accent"
                    size="lg"
                    className="w-full"
                  >
                    {isMinting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Minting NFT...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Mint Achievement NFT
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Success State */
          <div className="border border-accent/20 rounded-xl p-4 bg-accent/5 text-center">
            <CheckCircle className="w-12 h-12 text-accent mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-2">NFT Minted Successfully! 🎉</h3>
            <p className="text-sm text-muted mb-4">
              Your quiz certificate has been minted on {targetChain.name}
            </p>
            
            <div className="flex gap-2 justify-center">
              <Button
                asChild
                variant="outline"
                size="sm"
              >
                <a 
                  href={getBaseExplorerUrl(mintSuccess.hash, targetChain.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Transaction
                </a>
              </Button>
            </div>
            
            <p className="text-xs text-muted mt-2">
              Transaction: {formatTxHash(mintSuccess.hash)}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {onClose && (
            <Button 
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Continue
            </Button>
          )}
          
          <Button
            onClick={() => window.location.href = '/farcaster/quizzes'}
            variant="accent"
            className="flex-1"
          >
            <Target className="w-4 h-4 mr-2" />
            More Quizzes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default QuizCompletionNFT
