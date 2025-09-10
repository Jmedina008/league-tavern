"use client"

import Link from "next/link"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"
import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-6 py-12 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Oops!</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Something went wrong</h2>
          <p className="text-gray-600 leading-relaxed">
            We encountered an unexpected error. This might be a temporary issue with loading 
            your league data or a problem on our end.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          
          <Link
            href="/"
            className="block px-4 py-2 text-blue-700 font-medium hover:underline"
          >
            <Home className="w-4 h-4 inline mr-2" />
            Go to Homepage
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="space-y-2">
            <p className="text-xs text-gray-500">
              If this problem persists, try:
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Refreshing the page</li>
              <li>• Checking your internet connection</li>
              <li>• Verifying your league ID in settings</li>
            </ul>
          </div>
          
          {error.digest && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-xs font-mono text-gray-600">
                Error ID: {error.digest}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
