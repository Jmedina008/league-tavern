import Link from "next/link"
import { ArrowLeft, Calendar, TrendingUp, TrendingDown, Minus, Target, Award, BarChart3 } from "lucide-react"
import { mockContent } from "@/lib/content"

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Find the article by ID
  const allArticles = [
    ...mockContent.previews.map(p => ({ ...p, type: 'preview' as const })),
    ...mockContent.recaps.map(r => ({ ...r, type: 'recap' as const })),
    ...mockContent.rankings.map(rank => ({ ...rank, type: 'ranking' as const }))
  ]
  
  const article = allArticles.find(a => a.id === id)

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">The article you're looking for doesn't exist.</p>
          <Link href="/articles" className="text-blue-700 font-semibold hover:underline">
            ← Back to Articles
          </Link>
        </div>
      </div>
    )
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'preview': return 'bg-blue-600'
      case 'recap': return 'bg-gray-900'
      case 'ranking': return 'bg-purple-600'
      default: return 'bg-gray-600'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'preview': return 'Preview'
      case 'recap': return 'Recap'
      case 'ranking': return 'Ranking'
      default: return 'Article'
    }
  }

  const getArticleTitle = (article: any) => {
    if (article.type === 'ranking') {
      return `#${article.rank} ${article.teamName} - Power Rankings`
    }
    return article.title
  }

  const getArticleSubtitle = (article: any) => {
    if (article.type === 'ranking') {
      return `Week ${article.week} • ${article.record} • Tier ${article.tier}`
    }
    return article.subtitle
  }

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-5 w-5 text-green-600" />
      case 'down': return <TrendingDown className="h-5 w-5 text-red-600" />
      case 'stable': return <Minus className="h-5 w-5 text-gray-600" />
      default: return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/articles" className="text-blue-700 font-semibold hover:underline flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Articles
        </Link>
      </div>

      <article className="bg-white rounded-2xl border p-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className={`${getTypeColor(article.type)} text-white text-xs font-black px-3 py-1.5 rounded-full uppercase`}>
              {getTypeLabel(article.type)}
            </span>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              {new Date(article.timestamp).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4">
            {getArticleTitle(article)}
          </h1>

          {getArticleSubtitle(article) && (
            <p className="text-lg text-gray-600 leading-relaxed">
              {getArticleSubtitle(article)}
            </p>
          )}

          {/* Article-specific metadata */}
          {article.type === 'ranking' && (
            <div className="flex items-center gap-4 mt-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-gray-800">#{article.rank}</span>
                {getTrendIcon(article.trend as 'up' | 'down' | 'stable')}
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-semibold">{article.record}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-semibold">Tier {article.tier}</span>
              </div>
            </div>
          )}

          {article.type === 'preview' && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">Prediction</span>
              </div>
              <p className="text-blue-900 mb-3">{article.prediction}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-700">Confidence:</span>
                <div className="flex-1 bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${article.confidence}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-blue-800">{article.confidence}%</span>
              </div>
            </div>
          )}

          {article.type === 'recap' && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-800">MVP</span>
              </div>
              <p className="text-gray-900">{article.mvp}</p>
            </div>
          )}
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="text-gray-800 leading-relaxed text-base space-y-4">
            {article.type === 'preview' && (
              <>
                <p>{article.content}</p>
                
                <div className="mt-8">
                  <h3 className="text-xl font-extrabold mb-4">Key Storylines</h3>
                  <ul className="space-y-2">
                    {article.keyStorylines.map((storyline, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold mt-1">•</span>
                        <span>{storyline}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {article.type === 'recap' && (
              <>
                <p>{article.content}</p>
                
                <div className="mt-8">
                  <h3 className="text-xl font-extrabold mb-4">Key Takeaways</h3>
                  <ul className="space-y-2">
                    {article.keyTakeaways.map((takeaway, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-gray-600 font-bold mt-1">•</span>
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {article.type === 'ranking' && (
              <div>
                <p className="text-lg leading-relaxed">{article.analysis}</p>
                
                <div className="mt-8 p-4 bg-purple-50 rounded-xl">
                  <h3 className="text-lg font-extrabold text-purple-900 mb-2">Ranking Analysis</h3>
                  <p className="text-purple-800">
                    This team's performance has been {article.trend === 'up' ? 'improving' : article.trend === 'down' ? 'declining' : 'consistent'} 
                    this season, moving from #{article.previousRank} to #{article.rank} in our power rankings.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Published by Fantasy Hub</span>
            <Link href="/articles" className="text-blue-700 hover:underline">
              View All Articles →
            </Link>
          </div>
        </footer>
      </article>
    </div>
  )
}
