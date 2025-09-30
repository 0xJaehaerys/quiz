"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { notifyReady, isFarcasterEnvironment, initFarcasterSDK, getFarcasterSDK } from '@/lib/fc'
import { Eye, EyeOff, RefreshCw, CheckCircle, XCircle } from "lucide-react"

export function FarcasterDebug() {
  const [isVisible, setIsVisible] = useState(false)
  const [debugInfo, setDebugInfo] = useState({
    isFarcasterEnv: false,
    sdkAvailable: false,
    readyStatus: 'unknown',
    userAgent: '',
    hostname: '',
    context: null,
  })

  const updateDebugInfo = async () => {
    const info = {
      isFarcasterEnv: isFarcasterEnvironment(),
      sdkAvailable: false,
      readyStatus: 'unknown',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
      hostname: typeof window !== 'undefined' ? window.location.hostname : '',
      context: null,
    }

    try {
      // Try to initialize SDK
      const initialized = await initFarcasterSDK()
      info.sdkAvailable = initialized

      if (initialized) {
        const sdk = getFarcasterSDK()
        if (sdk) {
          try {
            // Try to get context
            if (sdk.context) {
              info.context = sdk.context
            }
          } catch (err) {
            console.warn('Failed to get SDK context:', err)
          }
        }
      }
    } catch (error) {
      console.warn('Debug info update failed:', error)
    }

    setDebugInfo(info)
  }

  const testReady = async () => {
    try {
      setDebugInfo(prev => ({ ...prev, readyStatus: 'testing' }))
      const result = await notifyReady()
      setDebugInfo(prev => ({ 
        ...prev, 
        readyStatus: result ? 'success' : 'failed' 
      }))
    } catch (error) {
      setDebugInfo(prev => ({ ...prev, readyStatus: 'error' }))
      console.error('Ready test failed:', error)
    }
  }

  useEffect(() => {
    updateDebugInfo()
  }, [])

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="mb-2"
      >
        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        Debug
      </Button>

      {isVisible && (
        <Card className="w-80 max-w-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              Farcaster Debug
              <Button
                variant="ghost"
                size="sm"
                onClick={updateDebugInfo}
                className="h-auto p-1"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </CardTitle>
            <CardDescription className="text-xs">
              Development debugging info
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <p className="font-medium">Environment:</p>
                <Badge variant={debugInfo.isFarcasterEnv ? 'success' : 'default'}>
                  {debugInfo.isFarcasterEnv ? 'Farcaster' : 'Browser'}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <p className="font-medium">SDK:</p>
                <Badge variant={debugInfo.sdkAvailable ? 'success' : 'destructive'}>
                  {debugInfo.sdkAvailable ? 'Available' : 'Not Available'}
                </Badge>
              </div>
            </div>

            <div className="space-y-1">
              <p className="font-medium">Ready Status:</p>
              <div className="flex items-center gap-2">
                <Badge variant={
                  debugInfo.readyStatus === 'success' ? 'success' :
                  debugInfo.readyStatus === 'failed' || debugInfo.readyStatus === 'error' ? 'destructive' :
                  'default'
                }>
                  {debugInfo.readyStatus}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testReady}
                  disabled={debugInfo.readyStatus === 'testing'}
                  className="h-auto py-1 px-2 text-xs"
                >
                  Test Ready
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <p className="font-medium">Hostname:</p>
              <p className="text-muted font-mono break-all">{debugInfo.hostname}</p>
            </div>

            <div className="space-y-1">
              <p className="font-medium">User Agent:</p>
              <p className="text-muted font-mono text-[10px] break-all leading-tight">
                {debugInfo.userAgent.substring(0, 100)}...
              </p>
            </div>

            {debugInfo.context && (
              <div className="space-y-1">
                <p className="font-medium">SDK Context:</p>
                <pre className="text-[10px] bg-muted p-2 rounded overflow-auto max-h-20">
                  {JSON.stringify(debugInfo.context, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}