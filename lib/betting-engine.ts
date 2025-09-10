interface Matchup {
  matchup_id: number;
  roster_id: number;
  points: number;
  custom_points?: number;
  starters: string[];
  starters_points: number[];
  players_points: { [playerId: string]: number };
}

interface Roster {
  roster_id: number;
  owner_id: string;
  username?: string;
  display_name?: string;
  team_name?: string;
}

interface BettingLine {
  matchupId: string;
  team1: {
    name: string;
    owner: string;
    rosterId: string;
    projected: number;
  };
  team2: {
    name: string;
    owner: string;
    rosterId: string;
    projected: number;
  };
  spread: {
    favorite: string;
    line: number;
    odds: number;
  };
  total: {
    over: number;
    under: number;
    line: number;
  };
  moneyline: {
    team1Odds: number;
    team2Odds: number;
  };
}

/**
 * Generates sophisticated betting lines based on team projections and advanced analytics
 */
export async function generateBettingLines(
  matchups: Matchup[],
  rosters: Roster[],
  week: number
): Promise<BettingLine[]> {
  const bettingLines: BettingLine[] = [];

  // Group matchups by matchup_id to get head-to-head pairs
  const matchupMap = new Map<number, Matchup[]>();
  matchups.forEach(matchup => {
    if (!matchupMap.has(matchup.matchup_id)) {
      matchupMap.set(matchup.matchup_id, []);
    }
    matchupMap.get(matchup.matchup_id)!.push(matchup);
  });

  // Generate lines for each matchup
  matchupMap.forEach((teams, matchupId) => {
    if (teams.length !== 2) return; // Skip if not exactly 2 teams

    const [team1, team2] = teams;
    const roster1 = rosters.find(r => r.roster_id === team1.roster_id);
    const roster2 = rosters.find(r => r.roster_id === team2.roster_id);

    if (!roster1 || !roster2) return;

    // Calculate projections using sophisticated methodology
    const team1Projection = calculateAdvancedProjection(team1, week);
    const team2Projection = calculateAdvancedProjection(team2, week);

    // Generate betting line
    const bettingLine = generateLineForMatchup(
      matchupId.toString(),
      {
        roster: roster1,
        matchup: team1,
        projection: team1Projection
      },
      {
        roster: roster2,
        matchup: team2,
        projection: team2Projection
      }
    );

    bettingLines.push(bettingLine);
  });

  return bettingLines;
}

/**
 * Calculate advanced projection incorporating multiple factors
 */
function calculateAdvancedProjection(matchup: Matchup, week: number): number {
  // Base projection from current/custom points
  let baseProjection = matchup.custom_points || matchup.points || 0;
  
  // If no points available, use a reasonable default based on league averages
  if (baseProjection === 0) {
    baseProjection = 95; // League average baseline
  }

  // Apply week-based adjustments
  let weeklyProjection = baseProjection;

  // Early season (weeks 1-4): Higher variance, adjust toward mean
  if (week <= 4) {
    const meanReversion = 0.15; // 15% reversion to league average
    weeklyProjection = baseProjection * (1 - meanReversion) + (95 * meanReversion);
  }

  // Mid-season stability (weeks 5-12): Use projections more directly
  else if (week <= 12) {
    weeklyProjection = baseProjection;
  }

  // Late season/playoffs (weeks 13+): Account for playoff urgency
  else {
    const playoffBoost = 0.05; // 5% boost for playoff implications
    weeklyProjection = baseProjection * (1 + playoffBoost);
  }

  // Apply positional baseline adjustments
  weeklyProjection = applyPositionalBaseline(weeklyProjection, matchup);

  // Add slight random variance to prevent identical lines
  const variance = (Math.random() - 0.5) * 3; // ±1.5 points variance
  weeklyProjection += variance;

  return Math.round(weeklyProjection * 100) / 100; // Round to 2 decimal places
}

/**
 * Apply positional strength analysis
 */
function applyPositionalBaseline(projection: number, matchup: Matchup): number {
  // Analyze starter composition and apply adjustments
  const starterCount = matchup.starters?.length || 9;
  
  // Teams with stronger lineup depth (more consistent scorers) get slight boost
  if (starterCount >= 9) {
    const starterPoints = matchup.starters_points || [];
    const avgStarterScore = starterPoints.length > 0 
      ? starterPoints.reduce((a, b) => a + b, 0) / starterPoints.length
      : projection / starterCount;
    
    // Teams with more balanced scoring get small reliability boost
    const balanceScore = calculateBalanceScore(starterPoints);
    const reliabilityBoost = balanceScore * 0.5; // Max 0.5 point boost
    
    return projection + reliabilityBoost;
  }

  return projection;
}

/**
 * Calculate team balance score (higher = more balanced scoring)
 */
function calculateBalanceScore(scores: number[]): number {
  if (scores.length < 2) return 0;
  
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  
  // Lower standard deviation = more balanced = higher score (inverted)
  return Math.max(0, 1 - (stdDev / mean));
}

/**
 * Generate complete betting line for a matchup
 */
function generateLineForMatchup(
  matchupId: string,
  team1: { roster: Roster; matchup: Matchup; projection: number },
  team2: { roster: Roster; matchup: Matchup; projection: number }
): BettingLine {
  const projectionDiff = team1.projection - team2.projection;
  
  // Determine favorite and spread
  const isFavorite1 = projectionDiff > 0;
  const favorite = isFavorite1 ? team1.roster.roster_id.toString() : team2.roster.roster_id.toString();
  const spreadLine = Math.abs(projectionDiff);
  
  // Calculate total line (sum of projections with slight adjustment)
  const totalLine = Math.round((team1.projection + team2.projection) * 2) / 2; // Round to nearest 0.5
  
  // Generate odds using industry-standard calculations
  const spreadOdds = calculateSpreadOdds(spreadLine);
  const totalOdds = calculateTotalOdds();
  const moneylineOdds = calculateMoneylineOdds(projectionDiff);

  return {
    matchupId,
    team1: {
      name: team1.roster.team_name || team1.roster.display_name || `Team ${team1.roster.roster_id}`,
      owner: team1.roster.username || team1.roster.display_name || `Owner ${team1.roster.roster_id}`,
      rosterId: team1.roster.roster_id.toString(),
      projected: team1.projection
    },
    team2: {
      name: team2.roster.team_name || team2.roster.display_name || `Team ${team2.roster.roster_id}`,
      owner: team2.roster.username || team2.roster.display_name || `Owner ${team2.roster.roster_id}`,
      rosterId: team2.roster.roster_id.toString(),
      projected: team2.projection
    },
    spread: {
      favorite,
      line: Math.round(spreadLine * 2) / 2, // Round to nearest 0.5
      odds: spreadOdds
    },
    total: {
      over: totalOdds.over,
      under: totalOdds.under,
      line: totalLine
    },
    moneyline: {
      team1Odds: moneylineOdds.team1,
      team2Odds: moneylineOdds.team2
    }
  };
}

/**
 * Calculate spread odds based on line strength
 */
function calculateSpreadOdds(spreadLine: number): number {
  // Standard spread odds, slight adjustment based on line size
  if (spreadLine <= 3) return -110;
  if (spreadLine <= 7) return -105;
  if (spreadLine <= 14) return -115;
  return -120; // Large spreads get slightly worse odds
}

/**
 * Calculate over/under odds
 */
function calculateTotalOdds(): { over: number; under: number } {
  // Standard total betting odds
  return {
    over: -110,
    under: -110
  };
}

/**
 * Calculate moneyline odds based on projection difference
 */
function calculateMoneylineOdds(projectionDiff: number): { team1: number; team2: number } {
  const absDiff = Math.abs(projectionDiff);
  
  // Convert projection difference to probability
  let favoriteImpliedProb: number;
  
  if (absDiff <= 3) {
    favoriteImpliedProb = 0.55; // Close games
  } else if (absDiff <= 7) {
    favoriteImpliedProb = 0.62; // Moderate favorites
  } else if (absDiff <= 14) {
    favoriteImpliedProb = 0.70; // Strong favorites
  } else {
    favoriteImpliedProb = 0.78; // Heavy favorites
  }
  
  const underdogImpliedProb = 1 - favoriteImpliedProb;
  
  // Convert probabilities to American odds
  const favoriteOdds = favoriteImpliedProb > 0.5 
    ? Math.round(-(favoriteImpliedProb / (1 - favoriteImpliedProb)) * 100)
    : Math.round(((1 - favoriteImpliedProb) / favoriteImpliedProb) * 100);
  
  const underdogOdds = underdogImpliedProb < 0.5
    ? Math.round(((1 - underdogImpliedProb) / underdogImpliedProb) * 100)
    : Math.round(-(underdogImpliedProb / (1 - underdogImpliedProb)) * 100);

  // Return odds based on which team is favored
  if (projectionDiff > 0) {
    return { team1: favoriteOdds, team2: underdogOdds };
  } else {
    return { team1: underdogOdds, team2: favoriteOdds };
  }
}
