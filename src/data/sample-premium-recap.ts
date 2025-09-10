export const samplePremiumRecapData = {
  matchup_id: "mcm-vs-ybfah-week3",
  week: 3,
  game_state: "completed" as const,
  
  // TRANSFORMED FROM: "Music City Miracle came into the game as the biggest favorite"
  // TO: Premium journalistic headline with deeper context
  headline: "Newton's Historic Ground Game Powers Music City Miracle's Methodical Dismantling",
  subheading: "A comprehensive 103-87 victory showcased systematic dominance as Cam Newton rewrote QB rushing history while exposing fundamental flaws in Yer Burton's roster construction strategy.",
  narrative_framework: "dominant_performance" as const,
  
  winner: {
    name: "Music City Miracle",
    owner: "Alex Thompson",
    score: 103,
    projected_score: 98.5,
    record: "2-1",
    new_power_ranking: 3,
    season_narrative: {
      trajectory: "ascending" as const,
      momentum_shift: true,
      power_ranking_movement: +2,
      season_defining_moment: false,
      championship_implications: "This victory establishes Music City Miracle as a legitimate contender, moving them into tier-two championship conversation with their balanced scoring attack and consistent projection beating."
    },
    team_analytics: {
      efficiency_metrics: {
        projection_accuracy: 104.6, // 103/98.5 * 100
        consistency_score: 87.3,
        ceiling_realization: 78.2,
        floor_protection: 91.4
      },
      contextual_performance: {
        vs_expectation: 15.4,
        roster_utilization: 89.7,
        strategic_execution: 92.1
      }
    },
    key_performers: [
      {
        name: "Cam Newton",
        position: "QB",
        projected: 22.4,
        actual: 30.0,
        variance_percentage: 33.9,
        context: "Two rushing touchdowns extended his NFL-record lead for QB ground scores, while his 89% red zone efficiency anchored a dominant offensive display.",
        performance_tier: "elite" as const,
        narrative_significance: "Newton's historic rushing prowess isn't just accumulating records—it's redefining how fantasy managers should evaluate mobile quarterbacks in goal-line situations. His floor has become a ceiling for traditional pocket passers."
      },
      {
        name: "DeAndre Hopkins",
        position: "WR",
        projected: 14.8,
        actual: 18.6,
        variance_percentage: 25.7,
        context: "Seven targets in the red zone showed Newton's trust, converting 4 of 5 opportunities inside the 20 for his most efficient game of the season.",
        performance_tier: "strong" as const,
        narrative_significance: "Hopkins' red zone dominance suggests the Newton-Hopkins connection has evolved beyond simple volume—they've developed situational chemistry that creates matchup advantages others can't replicate."
      },
      {
        name: "Christian McCaffrey", 
        position: "RB",
        projected: 16.2,
        actual: 19.8,
        variance_percentage: 22.2,
        context: "The dual-threat back complemented Newton perfectly, finding soft spots in coverage when defenses keyed on the QB's rushing threat.",
        performance_tier: "strong" as const,
        narrative_significance: "McCaffrey's performance exemplifies how elite players elevate their games when paired with complementary skill sets. His route-running precision created the space Newton needed to operate."
      }
    ]
  },
  
  loser: {
    name: "Yer Burton for a Hurtin",
    owner: "Chris Martinez", 
    score: 87,
    projected_score: 94.2,
    record: "1-2",
    new_power_ranking: 10,
    season_narrative: {
      trajectory: "declining" as const,
      momentum_shift: false,
      power_ranking_movement: -3,
      season_defining_moment: false,
      championship_implications: "Three weeks of systematic underperformance suggests deeper roster construction issues. Without immediate strategic changes, playoff hopes may already be fading."
    },
    team_analytics: {
      efficiency_metrics: {
        projection_accuracy: 92.3,
        consistency_score: 64.1,
        ceiling_realization: 43.7,
        floor_protection: 71.2
      },
      contextual_performance: {
        vs_expectation: -7.6,
        roster_utilization: 67.3,
        strategic_execution: 58.9
      }
    },
    disappointing_performers: [
      {
        name: "Kenyan Drake",
        position: "RB",
        projected: 11.4,
        actual: 2.1,
        variance_percentage: -81.6,
        context: "Just 8 carries for 33 yards as the Raiders abandoned the ground game early, leaving Drake stranded in a pass-heavy game script he couldn't influence.",
        performance_tier: "catastrophic" as const,
        narrative_significance: "Drake's collapse exposes a fundamental flaw in roster construction—betting on volume over talent. His game-script dependency makes him a weekly liability rather than a reliable producer."
      },
      {
        name: "Saints Defense/ST",
        position: "DEF",
        projected: 8.2,
        actual: 1.0,
        variance_percentage: -87.8,
        context: "Zero sacks, zero turnovers, and 28 points allowed to a Falcons offense that had been struggling. The worst defensive showing by any unit this week across all leagues.",
        performance_tier: "catastrophic" as const,
        narrative_significance: "This performance reveals the dangers of chasing defensive 'upside' without considering weekly floors. Elite defenses create turnovers regardless of opponent—the Saints simply aren't elite."
      },
      {
        name: "Mike Evans",
        position: "WR",
        projected: 13.6,
        actual: 8.4,
        variance_percentage: -38.2,
        context: "Three targets in the red zone but zero conversions, highlighting Tampa Bay's continued struggles to find rhythm in high-leverage situations.",
        performance_tier: "disappointing" as const,
        narrative_significance: "Evans' red zone struggles reflect broader Bucs offensive issues. When a player of his caliber can't capitalize on premium opportunities, it signals systematic problems that extend beyond individual performance."
      }
    ]
  },
  
  // TRANSFORMED FROM: Basic score report
  // TO: Advanced game flow analysis
  game_flow: {
    turning_points: [
      {
        player: "Cam Newton",
        moment: "1-yard rushing TD to cap 12-play opening drive (1:47 Q1)",
        impact: "Set the methodical pace that would define the entire game, establishing red zone dominance immediately",
        swing_value: 8.2
      },
      {
        player: "Kenyan Drake", 
        moment: "Stuffed on 3rd & 1, leading to Raiders punt (11:23 Q2)",
        impact: "Momentum-killing failure that epitomized Burton's inability to capitalize on scoring opportunities",
        swing_value: -6.1
      },
      {
        player: "DeAndre Hopkins",
        moment: "17-yard TD reception on perfectly executed out-route (3:15 Q3)",
        impact: "The dagger score that transformed a close game into a statement victory, showcasing Newton-Hopkins chemistry",
        swing_value: 9.7
      }
    ],
    momentum_shifts: 3,
    lead_changes: 1
  },
  
  // TRANSFORMED FROM: "Cam Newton led a very balanced group"
  // TO: Deep statistical context and historical significance
  statistical_storylines: [
    {
      type: "record_breaking" as const,
      headline: "Newton Extends Unprecedented QB Rushing Touchdown Streak",
      data_point: "75 career rushing TDs (most by QB in NFL history)",
      significance: "Newton's two ground scores this week extended his NFL record, but more importantly demonstrated how his unique skill set creates scoring opportunities that traditional metrics can't capture.",
      broader_implications: "This performance reinforces Newton's value proposition in fantasy: while his passing numbers fluctuate, his goal-line rushing ability provides a weekly floor that separates him from the quarterback pack. Fantasy managers rostering Newton essentially get a RB1 handcuff at the QB position."
    },
    {
      type: "statistical_anomaly" as const,
      headline: "Saints Defense Posts Historically Poor Cross-League Performance",
      data_point: "1.0 fantasy points (worst DEF performance across 47 tracked leagues this week)",
      significance: "The Saints' catastrophic showing represents the type of outlier performance that occurs roughly once every 200 defensive starts—a true statistical aberration that single-handedly derailed multiple fantasy lineups.",
      broader_implications: "This game highlights the inherent volatility of streaming defenses. While the Saints appeared to offer upside against a struggling Falcons offense, their floor proved catastrophically low. The performance serves as a reminder that defensive consistency trumps perceived upside in most fantasy contexts."
    },
    {
      type: "trend_reversal" as const,
      headline: "Music City Miracle Achieves Rare Projection-Beating Consistency",
      data_point: "3 straight weeks beating projections (104.6% weekly average)",
      significance: "Only 12% of fantasy teams consistently exceed projections over three-game stretches, suggesting superior roster construction and lineup optimization rather than mere luck.",
      broader_implications: "This consistency suggests Music City Miracle has cracked the code on maximizing their roster's potential. Their ability to consistently outperform projections indicates strategic advantages in player evaluation, waiver wire targeting, or lineup construction that other teams haven't identified."
    }
  ],
  
  expert_analysis: {
    key_tactical_decisions: [
      "Starting Newton over streaming options like Goff showcased faith in upside over perceived safety—a decision that paid massive dividends in both floor and ceiling",
      "Rostering Hopkins through his early-season struggles while other managers panicked has proven prescient as the Newton-Hopkins connection reaches its potential",
      "The decision to play McCaffrey despite concerns about his workload balance showed understanding of how elite talents transcend usage concerns"
    ],
    what_if_scenarios: [
      {
        scenario: "If Drake had managed even 8 fantasy points (his season average)",
        impact: "Burton's deficit shrinks to single digits, potentially changing late-game strategic decisions and creating a much more competitive finish"
      },
      {
        scenario: "If Saints Defense posted a league-average 6 points",
        impact: "Burton scores 92 points, turning a blowout into a nail-biter and potentially shifting power rankings dramatically"
      },
      {
        scenario: "If Music City Miracle had started their usual QB streaming option (Goff, 14.2 pts)",
        impact: "Their margin of victory shrinks to just 1.4 points, transforming a statement win into a lucky escape"
      }
    ],
    season_implications: [
      "Music City Miracle's consistent outperformance suggests they've built sustainable competitive advantages that will persist throughout the season",
      "Burton's systematic underperformance indicates roster construction flaws that require aggressive waiver wire activity or trade consideration",
      "The performance gap between these teams is widening—what looked like comparable rosters in preseason have revealed fundamental strategic differences",
      "Newton's historic rushing production makes him virtually undroppable despite occasional passing game inconsistencies"
    ]
  },
  
  next_week_preview: {
    winner_opponent: "RevRunners", 
    winner_storyline: "A trap game against an 0-3 team desperate for their first win. Music City Miracle's consistency will be tested against a team with nothing to lose and everything to prove.",
    winner_win_probability: 66,
    loser_opponent: "Men of Steel",
    loser_storyline: "A crucial bounce-back spot against the league's other struggling offense. Both teams need this victory to keep playoff hopes alive—expect aggressive lineup decisions and high-risk, high-reward strategies.",
    loser_win_probability: 51
  }
};

// Sample usage for the CBS comparison:
export const cbsStyleRecap = {
  basic_headline: "Music City Miracle beats Yer Burton for a Hurtin 103-87",
  basic_analysis: "Cam Newton led a very balanced group of four overperformers for Music City Miracle this week, delivering 30 points. Meanwhile, Kenyan Drake and the Saints Defense/ST were double trouble for Yer Burton for a Hurtin, together delivering only 3 points."
};

export const premiumUpgrade = {
  headline_transformation: {
    before: "Music City Miracle beats Yer Burton for a Hurtin 103-87", 
    after: "Newton's Historic Ground Game Powers Music City Miracle's Methodical Dismantling"
  },
  analysis_depth: {
    before: "Basic player performance summary",
    after: "Multi-layered analysis including historical context, game flow, statistical anomalies, and season-long implications"
  },
  insight_quality: {
    before: "Surface-level observations",
    after: "Expert-level tactical analysis, what-if scenarios, and predictive frameworks"
  }
};
