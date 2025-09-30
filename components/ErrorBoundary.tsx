'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  level?: 'page' | 'component' | 'critical'
}

interface ErrorFallbackProps {
  error?: Error
  errorInfo?: React.ErrorInfo
  resetError: () => void
  level?: 'page' | 'component' | 'critical'
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🐛 Error caught by Error Boundary:', error, errorInfo)
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo)
    }
    
    this.setState({
      error,
      errorInfo
    })
  }

  private logErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    // In production, you would send this to your error tracking service
    // like Sentry, Bugsnag, or custom analytics
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        level: this.props.level || 'component'
      }
      
      console.log('📊 Would log error to service:', errorData)
      
      // Example: Send to your analytics endpoint
      // fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData)
      // }).catch(() => {}) // Fail silently
      
    } catch (logError) {
      console.error('Failed to log error to service:', logError)
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      
      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
          level={this.props.level}
        />
      )
    }

    return this.props.children
  }
}

// Default error fallback component
function DefaultErrorFallback({ 
  error, 
  errorInfo, 
  resetError, 
  level = 'component' 
}: ErrorFallbackProps) {
  const isCritical = level === 'critical'
  const isPageLevel = level === 'page'
  
  return (
    <div className={`
      flex items-center justify-center 
      ${isPageLevel || isCritical ? 'min-h-screen' : 'min-h-[200px]'} 
      p-4
    `}>
      <Card className={`
        w-full max-w-md border-destructive/20 
        ${isCritical ? 'bg-destructive/5' : ''}
      `}>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4 animate-fade-in">
            <AlertTriangle className="w-8 h-8 text-destructive" strokeWidth={1.5} />
          </div>
          
          <CardTitle className="text-foreground">
            {isCritical ? 'Critical Error' : 
             isPageLevel ? 'Page Error' : 'Something went wrong'}
          </CardTitle>
          
          <CardDescription className="text-muted leading-relaxed">
            {isCritical 
              ? 'A critical error occurred. Please reload the page and try again.'
              : isPageLevel 
              ? 'This page encountered an error. You can try reloading or go back to the home page.'
              : 'This component encountered an error. You can try again or continue using the app.'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Error details in development */}
          {process.env.NODE_ENV === 'development' && error && (
            <div className="p-4 bg-panel rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Bug className="w-4 h-4 text-muted" />
                <span className="text-sm font-medium text-muted">Debug Info</span>
              </div>
              <p className="text-xs text-muted font-mono leading-relaxed">
                {error.message}
              </p>
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-accent cursor-pointer hover:underline">
                    Show stack trace
                  </summary>
                  <pre className="text-xs text-muted mt-2 whitespace-pre-wrap overflow-auto max-h-32">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={resetError}
              variant="accent"
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Try Again
            </Button>
            
            {(isPageLevel || isCritical) && (
              <Button 
                onClick={() => window.location.href = '/farcaster'}
                variant="outline"
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Go Home
              </Button>
            )}
          </div>
          
          {isCritical && (
            <Button
              onClick={() => window.location.reload()}
              variant="ghost"
              size="sm"
              className="w-full"
            >
              Reload Page
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Specialized Error Boundaries for different contexts

export function QuizErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      level="component"
      onError={(error, errorInfo) => {
        console.error('Quiz component error:', error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export function PageErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      level="page"
      onError={(error, errorInfo) => {
        console.error('Page-level error:', error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export function CriticalErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      level="critical"
      onError={(error, errorInfo) => {
        console.error('Critical error:', error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

// Hook for handling async errors in components
export function useErrorHandler() {
  return React.useCallback((error: Error) => {
    console.error('Async error caught:', error)
    // In a real app, you might want to throw this to trigger an error boundary
    // or handle it differently based on the error type
    throw error
  }, [])
}

// Higher-order component for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryConfig?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => {
    return (
      <ErrorBoundary {...errorBoundaryConfig}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

export default ErrorBoundary
