"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  isFarcasterEnvironment, 
  getCurrentFarcasterUser, 
  initFarcasterSDK,
  getFarcasterSDK 
} from '@/lib/fc'
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Eye, EyeOff } from 'lucide-react'

export function FarcasterDebug() {
  const [isVisible, setIsVisible] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runDiagnostics = async () => {
    setIsLoading(true)
    const info: any = {
      timestamp: new Date().toISOString(),
      environment: {},
      sdk: {},
      user: {},
      config: {}
    }

    try {
      // Environment checks
      info.environment = {
        isFarcaster: isFarcasterEnvironment(),
        userAgent: navigator.userAgent,
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        hasWindow: typeof window !== 'undefined',
        hasFarcasterGlobal: !!(window as any).farcaster,
        hasFcGlobal: !!(window as any).fc
      }

      // SDK checks
      try {
        await initFarcasterSDK()
        const sdk = getFarcasterSDK()
        info.sdk = {
          initialized: true,
          hasActions: !!sdk.actions,
          hasContext: !!sdk.context,
          contextKeys: sdk.context ? Object.keys(sdk.context) : [],
          isInstalled: sdk.context?.isInstalled
        }
      } catch (error) {
        info.sdk = {
          initialized: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }

      // User checks
      try {
        const user = await getCurrentFarcasterUser()
        info.user = {
          found: !!user,
          data: user ? {
            fid: user.fid,
            username: user.username,
            displayName: user.displayName
          } : null
        }
      } catch (error) {
        info.user = {
          found: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }

      // Config checks
      info.config = {
        hasNeynarApiKey: !!process.env.NEYNAR_API_KEY,
        hasNeynarAppId: !!process.env.NEXT_PUBLIC_NEYNAR_APP_ID,
        hasPublicHost: !!process.env.NEXT_PUBLIC_PUBLIC_HOST,
        nodeEnv: process.env.NODE_ENV
      }

    } catch (error) {
      info.error = error instanceof Error ? error.message : 'Unknown error'
    }

    setDebugInfo(info)
    setIsLoading(false)
  }

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      runDiagnostics()
    }
  }, [])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const StatusIcon = ({ status }: { status: boolean | undefined }) => {
    if (status === true) return <CheckCircle className="w-4 h-4 text-green-500" />
    if (status === false) return <XCircle className="w-4 h-4 text-red-500" />
    return <AlertTriangle className="w-4 h-4 text-yellow-500" />
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => setIsVisible(!isVisible)}
        variant="outline"
        size="sm"
        className="mb-2"
      >
        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        Debug
      </Button>

      {isVisible && (
        <Card className="w-96 max-h-96 overflow-y-auto">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Farcaster Debug</CardTitle>
              <Button
                onClick={runDiagnostics}
                disabled={isLoading}
                variant="ghost"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="text-xs space-y-3">
            {debugInfo && (
              <>
                {/* Environment */}
                <div>
                  <div className="font-semibold mb-1">Environment</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusIcon status={debugInfo.environment.isFarcaster} />
                      <span>Farcaster Environment: {debugInfo.environment.isFarcaster ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIcon status={debugInfo.environment.hasFarcasterGlobal} />
                      <span>Farcaster Global: {debugInfo.environment.hasFarcasterGlobal ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="text-muted text-xs">
                      Host: {debugInfo.environment.hostname}
                    </div>
                  </div>
                </div>

                {/* SDK */}
                <div>
                  <div className="font-semibold mb-1">SDK</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusIcon status={debugInfo.sdk.initialized} />
                      <span>SDK Initialized: {debugInfo.sdk.initialized ? 'Yes' : 'No'}</span>
                    </div>
                    {debugInfo.sdk.error && (
                      <div className="text-red-500 text-xs">Error: {debugInfo.sdk.error}</div>
                    )}
                    {debugInfo.sdk.hasContext && (
                      <div className="flex items-center gap-2">
                        <StatusIcon status={debugInfo.sdk.isInstalled} />
                        <span>Is Installed: {debugInfo.sdk.isInstalled ? 'Yes' : 'No'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* User */}
                <div>
                  <div className="font-semibold mb-1">User</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusIcon status={debugInfo.user.found} />
                      <span>User Found: {debugInfo.user.found ? 'Yes' : 'No'}</span>
                    </div>
                    {debugInfo.user.data && (
                      <div className="text-muted text-xs">
                        @{debugInfo.user.data.username} (FID: {debugInfo.user.data.fid})
                      </div>
                    )}
                    {debugInfo.user.error && (
                      <div className="text-red-500 text-xs">Error: {debugInfo.user.error}</div>
                    )}
                  </div>
                </div>

                {/* Config */}
                <div>
                  <div className="font-semibold mb-1">Config</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusIcon status={debugInfo.config.hasNeynarApiKey} />
                      <span>Neynar API Key: {debugInfo.config.hasNeynarApiKey ? 'Set' : 'Missing'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIcon status={debugInfo.config.hasNeynarAppId} />
                      <span>Neynar App ID: {debugInfo.config.hasNeynarAppId ? 'Set' : 'Missing'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIcon status={debugInfo.config.hasPublicHost} />
                      <span>Public Host: {debugInfo.config.hasPublicHost ? 'Set' : 'Missing'}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {debugInfo.config.nodeEnv}
                    </Badge>
                  </div>
                </div>

                <div className="text-xs text-muted pt-2 border-t">
                  Updated: {new Date(debugInfo.timestamp).toLocaleTimeString()}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
