import Link from "next/link"
import { ArrowLeft, Calendar, User, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { mockContent } from "@/lib/content"

export default function ArticlesPage() {
  const allArticles = [
    ...mockContent.previews.map(p => ({ ...p, type: 'preview' as const })),
    ...mockContent.recaps.map(r => ({ ...r, type: 'recap' as const })),
    ...mockContent.rankings.map(rank => ({ ...rank, type: 'ranking' as const }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

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
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />
      default: return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="text-blue-700 font-semibold hover:underline flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <h1 className="text-3xl font-extrabold">Latest Articles</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allArticles.map((article) => (
          <article key={article.id} className="rounded-2xl border bg-white overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className={`${getTypeColor(article.type)} text-white text-[10px] font-black px-2 py-1 rounded uppercase`}>
                  {getTypeLabel(article.type)}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {new Date(article.timestamp).toLocaleDateString()}
                </div>
              </div>

              <h2 className="text-lg font-extrabold leading-tight mb-2 line-clamp-2">
                {getArticleTitle(article)}
              </h2>

              {getArticleSubtitle(article) && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {getArticleSubtitle(article)}
                </p>
              )}

              {article.type === 'ranking' && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-gray-700">#{article.rank}</span>
                  {getTrendIcon(article.trend as 'up' | 'down' | 'stable')}
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded font-semibold">
                    Tier {article.tier}
                  </span>
                </div>
              )}

              {article.type === 'preview' && (
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1">Prediction Confidence</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${article.confidence}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{article.confidence}%</div>
                </div>
              )}

              <div className="text-sm text-gray-700 line-clamp-3 mb-4">
                {article.type === 'preview' && article.content}
                {article.type === 'recap' && article.content}
                {article.type === 'ranking' && article.analysis}
              </div>

              <div className="flex items-center justify-between">
                <Link 
                  href={`/articles/${article.id}`}
                  className="text-blue-700 font-semibold hover:underline text-sm"
                >
                  Read Full Article →
                </Link>
                <div className="text-xs text-gray-500">
                  {article.type === 'preview' && 'Preview'}
                  {article.type === 'recap' && 'Recap'}
                  {article.type === 'ranking' && `Ranking #${article.rank}`}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-600 text-sm">
          More articles coming soon! Check back for weekly previews, recaps, and power rankings.
        </p>
      </div>
    </div>
  )
}
