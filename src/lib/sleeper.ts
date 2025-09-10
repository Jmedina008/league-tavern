const DEFAULT_LEAGUE_ID = process.env.LEAGUE_ID || "1180507846524702720"
const SLEEPER = "https://api.sleeper.app/v1"

export const revalidate = 60 // refresh data every 60s

// ---- Types (subset) ----
export type SleeperUser = { user_id: string; display_name: string; avatar?: string; metadata?: Record<string, any> }
export type SleeperRoster = { roster_id: number; owner_id: string | null; players?: string[]; starters?: string[]; settings: { wins: number; losses: number; ties: number; fpts: number; fpts_against: number }; metadata?: Record<string, any> }
export type SleeperMatchup = { roster_id: number; matchup_id: number; points: number; players_points?: Record<string, number> }

// ---- Data helpers ----
async function sx(path: string) {
  const r = await fetch(`${SLEEPER}${path}`, { next: { revalidate } })
  if (!r.ok) throw new Error(`Sleeper fetch failed: ${path}`)
  return r.json()
}

export async function getState() { 
  return sx(`/state/nfl`) 
}

export async function getCurrentWeek(): Promise<number> {
  try {
    const state = await getState()
    return Number(state?.week || 1)
  } catch (error) {
    console.error('Error fetching current week:', error)
    return 1
  }
}

export async function getUsers(leagueId?: string): Promise<SleeperUser[]> { 
  const id = leagueId || DEFAULT_LEAGUE_ID
  return sx(`/league/${id}/users`) 
}

export async function getRosters(leagueId?: string): Promise<SleeperRoster[]> { 
  const id = leagueId || DEFAULT_LEAGUE_ID
  return sx(`/league/${id}/rosters`) 
}

export async function getMatchups(week: number, leagueId?: string): Promise<SleeperMatchup[]> { 
  const id = leagueId || DEFAULT_LEAGUE_ID
  return sx(`/league/${id}/matchups/${week}`) 
}

export async function getTrendingAdds(hours = 48, limit = 10): Promise<{player_id: string; count: number}[]> { 
  return sx(`/players/trending/add?lookback_hours=${hours}&limit=${limit}`) 
}

export async function getTransactions(week: number, leagueId?: string): Promise<any[]> {
  const id = leagueId || DEFAULT_LEAGUE_ID
  return sx(`/league/${id}/transactions/${week}`)
}

export async function getPlayers(): Promise<Record<string, any>> {
  return sx(`/players/nfl`)
}

export async function getProjections(week: number, season_type: string = 'regular', position?: string): Promise<Record<string, any>> {
  const params = new URLSearchParams({
    season_type,
    week: week.toString()
  })
  if (position) params.set('position', position)
  return sx(`/projections/nfl/${new Date().getFullYear()}/${params.toString()}`)
}

export type SleeperPlayer = {
  player_id: string
  full_name: string
  first_name: string
  last_name: string
  team: string
  position: string
  age: number
  height: string
  weight: string
  years_exp: number
  status: string
}
