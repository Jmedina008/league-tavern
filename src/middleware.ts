import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const hostname = request.headers.get('host') || ''
  
  // Skip middleware for API routes, static files, Next.js internals, and debug routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/debug/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }
  
  // Extract subdomain
  const subdomain = getSubdomain(hostname)
  
  // If we have a subdomain, this is a league site
  if (subdomain && subdomain !== 'www') {
    // Rewrite to the league-specific page structure
    const url = request.nextUrl.clone()
    
    // Add the league subdomain as a query parameter
    url.searchParams.set('subdomain', subdomain)
    
    // Rewrite root requests to the league homepage
    if (pathname === '/') {
      url.pathname = '/league'
    } else {
      // Prepend /league to other paths
      url.pathname = `/league${pathname}`
    }
    
    return NextResponse.rewrite(url)
  }
  
  // No subdomain - serve the main marketing/onboarding site
  if (pathname === '/') {
    return NextResponse.rewrite(new URL('/landing', request.url))
  }
  
  return NextResponse.next()
}

function getSubdomain(hostname: string): string | null {
  // Handle localhost development
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    // For development, check for subdomain in format: subdomain.localhost:3000
    const parts = hostname.split('.')
    if (parts.length > 2 || (parts.length === 2 && parts[0] !== 'localhost')) {
      return parts[0]
    }
    return null
  }
  
  // Production: extract subdomain from fantasytavern.com
  const parts = hostname.split('.')
  if (parts.length >= 3 && (hostname.includes('fantasytavern.com') || hostname.includes('vercel.app'))) {
    return parts[0]
  }
  
  return null
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
