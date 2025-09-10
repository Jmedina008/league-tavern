import Link from "next/link"
import { ArrowLeft, Newspaper, Calendar, Trophy } from "lucide-react"

export const revalidate = 300 // refresh every 5 minutes

const LEAGUE_ID = process.env.LEAGUE_ID || "1180507846524702720"

export default function NewsPage() {
  // Sample news data - in a real app this would come from an API or database
  const news = [
    {
      id: 1,
      type: "TRADE" as const,
      title: "Major Trade Shakes Up League",
      summary: "Two contending teams swap key players in blockbuster deal",
      content: "In a shocking move that has the entire league talking, two playoff contenders have executed a major trade that could reshape the championship race...",
      date: "2024-12-07",
      author: "League Commissioner"
    },
    {
      id: 2,
      type: "INJURY" as const,
      title: "Star Player Injury Update",
      summary: "Fantasy implications and waiver wire pickups",
      content: "Following today's injury news, managers need to be aware of the fantasy implications and potential waiver wire targets...",
      date: "2024-12-06", 
      author: "Fantasy Analyst"
    },
    {
      id: 3,
      type: "WAIVER" as const,
      title: "Week 14 Waiver Wire Priorities",
      summary: "Top pickups for playoff push",
      content: "With playoffs approaching, here are the must-add players for your championship run...",
      date: "2024-12-05",
      author: "Waiver Wire Expert"
    },
    {
      id: 4,
      type: "STANDINGS" as const,
      title: "Playoff Picture Update",
      summary: "Current standings and scenarios",
      content: "Here's where things stand heading into the final weeks of the regular season...",
      date: "2024-12-04",
      author: "League Analyst"
    },
    {
      id: 5,
      type: "MATCHUP" as const,
      title: "Game of the Week Preview",
      summary: "Key matchup could decide playoff seeding",
      content: "This week's featured matchup has major implications for playoff positioning...",
      date: "2024-12-03",
      author: "Matchup Analyst"
    }
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case "TRADE": return "bg-blue-600"
      case "INJURY": return "bg-red-600"
      case "WAIVER": return "bg-green-600"
      case "STANDINGS": return "bg-purple-600"
      case "MATCHUP": return "bg-orange-600"
      default: return "bg-gray-600"
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/" className="text-blue-700 hover:underline flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-700 text-white">
              <Newspaper className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">League News</h1>
              <p className="text-gray-600 mt-1">Latest updates, trades, and analysis</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {news.map((article) => (
              <article key={article.id} className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold text-white ${getTypeColor(article.type)}`}>
                        {article.type}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(article.date)}</span>
                        <span>•</span>
                        <span>by {article.author}</span>
                      </div>
                      
                      <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                        {article.title}
                      </h2>
                      
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {article.summary}
                      </p>
                      
                      <p className="text-gray-700 text-sm leading-relaxed mb-4">
                        {article.content}
                      </p>
                      
                      <button className="text-blue-700 font-semibold hover:underline text-sm">
                        Read full article →
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Quick Links
              </h3>
              <div className="space-y-2">
                <Link href="/standings" className="block text-sm text-blue-700 hover:underline">
                  Current Standings
                </Link>
                <Link href="/matchups/this-week" className="block text-sm text-blue-700 hover:underline">
                  This Week's Matchups  
                </Link>
                <Link href="/teams" className="block text-sm text-blue-700 hover:underline">
                  Team Pages
                </Link>
                <Link href="/odds" className="block text-sm text-blue-700 hover:underline">
                  Playoff Odds
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-6">
              <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Last Trade</span>
                  <span className="text-gray-900 font-medium text-right">2 days ago</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Waiver Claims</span>
                  <span className="text-gray-900 font-medium">12 this week</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Active Managers</span>
                  <span className="text-gray-900 font-medium">10/10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
