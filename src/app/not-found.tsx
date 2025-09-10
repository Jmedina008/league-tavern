import Link from "next/link"
import { Home, Search, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-6 py-12 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-200 mb-6">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">404</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
          <p className="text-gray-600 leading-relaxed">
            Sorry, we couldn't find the page you're looking for. It might have been moved, 
            deleted, or you might have typed the wrong URL.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to Homepage
          </Link>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/matchups/this-week"
              className="inline-flex items-center gap-2 px-4 py-2 text-blue-700 font-medium hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              This Week's Matchups
            </Link>
            
            <Link
              href="/standings"
              className="inline-flex items-center gap-2 px-4 py-2 text-blue-700 font-medium hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              League Standings
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            If you believe this is an error, please check the URL or contact support.
          </p>
        </div>
      </div>
    </div>
  )
}
