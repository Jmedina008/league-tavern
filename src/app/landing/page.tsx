import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Fantasy Football Hub
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Transform your fantasy league with premium analytics, matchup previews, 
              and engaging content that your league members will love.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
                <Link href="/onboard">Create Your League Hub</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3 border-slate-600 text-slate-300 hover:bg-slate-800">
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything Your League Needs
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Professional-grade fantasy content and analytics, customized for your league
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Premium Matchup Analysis</CardTitle>
              <CardDescription className="text-slate-400">
                Data-driven previews and recaps with advanced player insights
              </CardDescription>
            </CardHeader>
            <CardContent className="text-slate-300">
              <ul className="space-y-2">
                <li>• Weekly matchup breakdowns</li>
                <li>• Player usage trends</li>
                <li>• Strategic storylines</li>
                <li>• Lineup recommendations</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">FAAB Sportsbook</CardTitle>
              <CardDescription className="text-slate-400">
                Fantasy betting with your league's FAAB budget
              </CardDescription>
            </CardHeader>
            <CardContent className="text-slate-300">
              <ul className="space-y-2">
                <li>• Weekly betting lines</li>
                <li>• Spread & over/under bets</li>
                <li>• FAAB transaction tracking</li>
                <li>• Commissioner tools</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">League Engagement</CardTitle>
              <CardDescription className="text-slate-400">
                Features that bring your league together
              </CardDescription>
            </CardHeader>
            <CardContent className="text-slate-300">
              <ul className="space-y-2">
                <li>• Rivalry tracking</li>
                <li>• Playoff odds</li>
                <li>• Power rankings</li>
                <li>• Team insights</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-slate-400">
              Three simple steps to transform your fantasy league
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Connect Your League</h3>
              <p className="text-slate-400">
                Enter your Sleeper league ID and we'll import all your league data
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Customize Your Hub</h3>
              <p className="text-slate-400">
                Choose your subdomain and customize settings for your league
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Share With League</h3>
              <p className="text-slate-400">
                Get your custom link and share it with your league members
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Elevate Your League?
        </h2>
        <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
          Join commissioners who are already using Fantasy Football Hub to create 
          more engaging and competitive fantasy leagues.
        </p>
        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
          <Link href="/onboard">Get Started Now</Link>
        </Button>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-slate-400">
            <p>&copy; 2025 Fantasy Football Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
