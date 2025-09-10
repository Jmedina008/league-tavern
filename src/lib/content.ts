// Content generation utilities for fantasy football analysis
export const revalidate = 60

// ---- Content Types ----
export type MatchupPreview = {
  id: string
  matchupId: number
  week: number
  title: string
  subtitle: string
  content: string
  keyStorylines: string[]
  prediction: string
  confidence: number
  timestamp: Date
}

export type MatchupRecap = {
  id: string
  matchupId: number
  week: number
  title: string
  subtitle: string
  content: string
  keyTakeaways: string[]
  mvp: string
  timestamp: Date
}

export type PowerRanking = {
  id: string
  week: number
  rank: number
  teamName: string
  previousRank: number
  record: string
  analysis: string
  trend: 'up' | 'down' | 'stable'
  tier: string
  timestamp: Date
}

// ---- Content Generation Functions ----
export function generateMatchupPreview(
  matchup: any,
  week: number,
  leagueContext: any
): MatchupPreview {
  const { spread, ou, upsetChance } = matchup.odds
  const fav = spread >= 0 ? matchup.teamA : matchup.teamB
  const dog = spread >= 0 ? matchup.teamB : matchup.teamA
  
  const title = `${fav.teamName} vs ${dog.teamName} - Week ${week} Preview`
  const subtitle = `Spread: ${spread >= 0 ? `-${Math.abs(spread)}` : `+${Math.abs(spread)}`} | O/U: ${ou} | Upset Chance: ${upsetChance}%`
  
  const content = `
    This week's matchup features ${fav.teamName} (${fav.record}) taking on ${dog.teamName} (${dog.record}) in what projects as a ${upsetChance > 45 ? 'competitive' : 'one-sided'} contest.
    
    ${fav.teamName} enters as the ${Math.abs(spread)}-point favorite, backed by their strong ${fav.teamName.includes('offense') ? 'offensive' : 'scoring'} performance this season. They're averaging ${fav.avgPoints.toFixed(1)} points per game while allowing ${fav.avgPointsAgainst.toFixed(1)}.
    
    ${dog.teamName} will need to overcome the spread, but they've shown resilience with a ${dog.record} record. Their ${dog.teamName.includes('defense') ? 'defensive' : 'scoring'} unit has been ${dog.avgPointsAgainst < leagueContext.leagueAvg ? 'stout' : 'vulnerable'}, allowing ${dog.avgPointsAgainst.toFixed(1)} points per game.
    
    The total is set at ${ou}, suggesting a ${ou > leagueContext.leagueAvg ? 'high-scoring' : 'defensive'} affair. Both teams will need their key players to step up in this crucial Week ${week} matchup.
  `.trim()
  
  const keyStorylines = [
    `${fav.teamName}'s ${fav.teamName.includes('offense') ? 'offensive' : 'scoring'} efficiency vs ${dog.teamName}'s defense`,
    `${dog.teamName}'s ability to keep it close despite being underdogs`,
    `Impact of recent roster moves and lineup decisions`,
    `Weather and injury factors that could swing the matchup`
  ]
  
  const prediction = `${fav.teamName} ${fav.teamName.includes('wins') ? 'wins' : 'covers'} ${Math.abs(spread) > 3 ? 'comfortably' : 'in a close one'}, ${ou > leagueContext.leagueAvg ? 'going over' : 'staying under'} the total.`
  const confidence = Math.max(50, Math.min(95, 75 - Math.abs(spread) * 2))
  
  return {
    id: `preview-${matchup.matchupId}-${week}`,
    matchupId: matchup.matchupId,
    week,
    title,
    subtitle,
    content,
    keyStorylines,
    prediction,
    confidence,
    timestamp: new Date()
  }
}

export function generateMatchupRecap(
  matchup: any,
  week: number,
  leagueContext: any
): MatchupRecap {
  const winner = matchup.teamA.points > matchup.teamB.points ? matchup.teamA : matchup.teamB
  const loser = matchup.teamA.points > matchup.teamB.points ? matchup.teamB : matchup.teamA
  const margin = Math.abs(matchup.teamA.points - matchup.teamB.points)
  
  const title = `${winner.teamName} ${winner.points.toFixed(1)} - ${loser.teamName} ${loser.points.toFixed(1)}`
  const subtitle = `Week ${week} Recap: ${winner.teamName} ${margin > 20 ? 'dominates' : margin > 10 ? 'defeats' : 'edges'} ${loser.teamName}`
  
  const content = `
    ${winner.teamName} emerged victorious in a ${margin > 20 ? 'lopsided' : margin > 10 ? 'competitive' : 'nail-biting'} Week ${week} matchup, defeating ${loser.teamName} by ${margin.toFixed(1)} points.
    
    ${winner.teamName} got off to a ${winner.teamName.includes('fast') ? 'fast' : 'strong'} start and never looked back, putting up ${winner.points.toFixed(1)} points behind stellar performances from their key players. Their ${winner.teamName.includes('offense') ? 'offensive' : 'scoring'} unit was firing on all cylinders, while their defense held ${loser.teamName} to just ${loser.points.toFixed(1)} points.
    
    ${loser.teamName} fought hard but couldn't overcome the deficit, despite some bright spots in their performance. They'll need to regroup and focus on ${loser.teamName.includes('defense') ? 'defensive' : 'offensive'} improvements heading into next week.
    
    This result ${winner.record.includes('win') ? 'solidifies' : 'improves'} ${winner.teamName}'s playoff position, while ${loser.teamName} will need to bounce back quickly to stay in contention.
  `.trim()
  
  const keyTakeaways = [
    `${winner.teamName}'s ${winner.teamName.includes('offense') ? 'offensive' : 'scoring'} efficiency was the difference maker`,
    `${loser.teamName} showed resilience but couldn't overcome the early deficit`,
    `Key injuries and lineup decisions impacted the final outcome`,
    `This result has significant playoff implications for both teams`
  ]
  
  const mvp = `${winner.teamName}'s ${winner.teamName.includes('QB') ? 'quarterback' : 'star player'} was the MVP with ${winner.points.toFixed(1)} points`
  
  return {
    id: `recap-${matchup.matchupId}-${week}`,
    matchupId: matchup.matchupId,
    week,
    title,
    subtitle,
    content,
    keyTakeaways,
    mvp,
    timestamp: new Date()
  }
}

export function generatePowerRankings(
  teams: any[],
  week: number,
  previousRankings?: PowerRanking[]
): PowerRanking[] {
  // Sort teams by power score (wins, points for, points against)
  const rankedTeams = teams
    .map(team => ({
      ...team,
      powerScore: team.wins * 20 + (team.pointsFor - team.pointsAgainst) / 10
    }))
    .sort((a, b) => b.powerScore - a.powerScore)
  
  return rankedTeams.map((team, index) => {
    const previousRank = previousRankings?.find(r => r.teamName === team.teamName)?.rank || index + 1
    const trend = previousRank > index + 1 ? 'up' : previousRank < index + 1 ? 'down' : 'stable'
    
    const tier = team.powerScore > 80 ? 'S' : team.powerScore > 60 ? 'A' : team.powerScore > 40 ? 'B' : 'C'
    
    const analysis = `
      ${team.teamName} (${team.record}) ${trend === 'up' ? 'climbs' : trend === 'down' ? 'falls' : 'holds steady'} to #${index + 1} this week. 
      Their ${team.pointsFor > team.pointsAgainst ? 'offensive' : 'defensive'} prowess has been impressive, 
      averaging ${team.pointsFor.toFixed(1)} points per game while allowing ${team.pointsAgainst.toFixed(1)}. 
      ${team.wins > team.losses ? 'Strong playoff positioning' : 'Need to turn things around'} as we approach the postseason.
    `.trim()
    
    return {
      id: `ranking-${team.teamName}-${week}`,
      week,
      rank: index + 1,
      teamName: team.teamName,
      previousRank,
      record: `${team.wins}-${team.losses}`,
      analysis,
      trend,
      tier,
      timestamp: new Date()
    }
  })
}

// ---- Mock Content for Development ----
export const mockContent = {
  previews: [
    {
      id: 'preview-1-1',
      matchupId: 1,
      week: 1,
      title: 'Team Alpha vs Team Beta - Week 1 Preview',
      subtitle: 'Spread: -3.5 | O/U: 145.2 | Upset Chance: 35%',
      content: 'This week\'s matchup features Team Alpha (2-1) taking on Team Beta (1-2) in what projects as a competitive contest. Team Alpha enters as the 3.5-point favorite, backed by their strong offensive performance this season. They\'re averaging 152.3 points per game while allowing 148.7. Team Beta will need to overcome the spread, but they\'ve shown resilience with a 1-2 record. Their defensive unit has been vulnerable, allowing 155.2 points per game. The total is set at 145.2, suggesting a defensive affair. Both teams will need their key players to step up in this crucial Week 1 matchup.',
      keyStorylines: [
        'Team Alpha\'s offensive efficiency vs Team Beta\'s defense',
        'Team Beta\'s ability to keep it close despite being underdogs',
        'Impact of recent roster moves and lineup decisions',
        'Weather and injury factors that could swing the matchup'
      ],
      prediction: 'Team Alpha covers comfortably, staying under the total.',
      confidence: 68,
      timestamp: new Date()
    }
  ],
  recaps: [
    {
      id: 'recap-1-1',
      matchupId: 1,
      week: 1,
      title: 'Team Alpha 156.7 - Team Beta 142.3',
      subtitle: 'Week 1 Recap: Team Alpha defeats Team Beta',
      content: 'Team Alpha emerged victorious in a competitive Week 1 matchup, defeating Team Beta by 14.4 points. Team Alpha got off to a strong start and never looked back, putting up 156.7 points behind stellar performances from their key players. Their offensive unit was firing on all cylinders, while their defense held Team Beta to just 142.3 points. Team Beta fought hard but couldn\'t overcome the deficit, despite some bright spots in their performance. They\'ll need to regroup and focus on offensive improvements heading into next week. This result improves Team Alpha\'s playoff position, while Team Beta will need to bounce back quickly to stay in contention.',
      keyTakeaways: [
        'Team Alpha\'s offensive efficiency was the difference maker',
        'Team Beta showed resilience but couldn\'t overcome the early deficit',
        'Key injuries and lineup decisions impacted the final outcome',
        'This result has significant playoff implications for both teams'
      ],
      mvp: 'Team Alpha\'s star player was the MVP with 156.7 points',
      timestamp: new Date()
    }
  ],
  rankings: [
    {
      id: 'ranking-team-alpha-1',
      week: 1,
      rank: 1,
      teamName: 'Team Alpha',
      previousRank: 3,
      record: '2-1',
      analysis: 'Team Alpha (2-1) climbs to #1 this week. Their offensive prowess has been impressive, averaging 152.3 points per game while allowing 148.7. Strong playoff positioning as we approach the postseason.',
      trend: 'up',
      tier: 'S',
      timestamp: new Date()
    }
  ]
}
