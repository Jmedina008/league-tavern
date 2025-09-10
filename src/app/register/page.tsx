"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterLeaguePage() {
  const router = useRouter()
  const [platform, setPlatform] = useState<"Sleeper" | "ESPN" | "Yahoo">("Sleeper")
  const [leagueId, setLeagueId] = useState("")
  const [name, setName] = useState("")

  useEffect(() => {
    const savedPlat = localStorage.getItem("hub_platform")
    const savedId = localStorage.getItem("hub_league_id")
    const savedName = localStorage.getItem("hub_name")
    if (savedPlat) setPlatform(savedPlat as any)
    if (savedId) setLeagueId(savedId)
    if (savedName) setName(savedName)
  }, [])

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    localStorage.setItem("hub_platform", platform)
    localStorage.setItem("hub_league_id", leagueId)
    if (name) localStorage.setItem("hub_name", name)
    const params = new URLSearchParams()
    if (leagueId) params.set("league", leagueId)
    router.push(`/${params.toString() ? "?" + params.toString() : ""}`)
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-extrabold">Register Your League</h1>
          <Link href="/" className="text-blue-700 font-semibold hover:underline">← Back to Home</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-600 mb-4">
          Choose your platform and enter your league ID. We'll redirect to the homepage with a <code>?league=</code> override so data pulls from your league immediately.
        </p>

        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border p-4 bg-white">
          <div>
            <label className="block text-sm font-semibold text-gray-800">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as any)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="Sleeper">Sleeper (live)</option>
              <option value="ESPN">ESPN (coming soon)</option>
              <option value="Yahoo">Yahoo (coming soon)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Sleeper is fully wired for the MVP. ESPN & Yahoo adapters coming next.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800">League ID</label>
            <input
              value={leagueId}
              onChange={(e) => setLeagueId(e.target.value)}
              placeholder="e.g., 1234567890123456789"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800">League Name (optional)</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your league's public name"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div className="pt-2">
            <button type="submit" className="rounded-lg bg-blue-700 text-white font-bold text-sm px-4 py-2">Save & View League</button>
          </div>
        </form>
      </main>
    </div>
  )
}
