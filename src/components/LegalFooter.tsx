import Link from "next/link"

export default function LegalFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded bg-blue-700 text-white text-sm font-black">HL</span>
              <span className="font-extrabold tracking-tight text-white">Fantasy Hub</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              The ultimate fantasy football companion for leagues, rivalries, and analytics.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/standings" className="block text-sm hover:text-white transition-colors">
                Standings
              </Link>
              <Link href="/matchups/this-week" className="block text-sm hover:text-white transition-colors">
                This Week's Matchups
              </Link>
              <Link href="/odds" className="block text-sm hover:text-white transition-colors">
                Playoff Odds
              </Link>
              <Link href="/register" className="block text-sm hover:text-white transition-colors">
                Register League
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <div className="space-y-2 text-xs text-gray-400">
              <p>
                <strong className="text-white">FAAB Only — No Real-Money Wagering</strong>
              </p>
              <p>
                All betting features use FAAB (Free Agent Acquisition Budget) points only. 
                No real money transactions are involved.
              </p>
              <p>
                Not affiliated with the NFL, ESPN, Yahoo, or Sleeper. 
                All team names and league data are user-provided.
              </p>
              <p>
                Fantasy sports for entertainment purposes only. 
                Please check your local laws regarding fantasy sports.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs text-gray-500">
              © {new Date().getFullYear()} Fantasy Hub. Educational and entertainment use only.
            </div>
            <div className="flex items-center gap-4 text-xs">
              <button className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                Contact
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
