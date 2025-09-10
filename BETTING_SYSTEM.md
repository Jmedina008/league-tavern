# Fantasy Football Betting Lines System

## Overview
The Fantasy Football Hub uses a sophisticated weekly projections system to generate accurate betting lines for fantasy matchups, designed specifically for FAAB-based wagering between league members.

## How It Works

### 1. Weekly Projections Engine
Instead of using basic season averages, our system generates **real weekly projections** based on:

#### Position-Based Baseline Scoring
- **QB**: 20-27 points
- **RB1**: 15-23 points  
- **RB2**: 8-14 points
- **WR1**: 13-22 points
- **WR2**: 9-16 points
- **WR3**: 6-11 points
- **TE**: 7-15 points
- **FLEX**: 8-14 points
- **K**: 8-12 points
- **DEF**: 6-14 points

#### Blended Performance Calculation
- **Season Performance (40%)**: Historical team scoring average
- **Weekly Baseline (60%)**: Position-based projections with variance
- **First-Time Teams**: Use baseline with ±10 point variance

### 2. Matchup Modifiers
Each projection is adjusted for weekly factors:

#### Opponent Strength
- **Defensive Rating**: Based on opponent's points allowed
- **Adjustment Range**: 0.8x to 1.2x base projection

#### Weekly Variables
- **Home Field Advantage**: ±2-5% boost simulation
- **Injury/News Factor**: 0.92x to 1.08x modifier
- **Matchup Dynamics**: Opponent-specific adjustments

### 3. Betting Lines Generation

#### Spread Calculation
- Based on **projection difference** between teams
- Rounded to nearest **0.5 point** (standard sportsbook format)
- Example: Team A (125 proj) vs Team B (118 proj) = **Team A -3.5**

#### Over/Under Total
- Sum of both team projections
- **2% vig adjustment** applied (industry standard)
- Example: 125 + 118 = 243 → **O/U 248**

#### Moneyline Odds
- **Heavy Favorite** (upset chance <30%): -180
- **Moderate Favorite** (upset chance 30-45%): -130  
- **Close Game** (upset chance >45%): -110

### 4. Line Locking System

#### Lock Schedule
Lines automatically lock to prevent late betting:

- **Thursday 8:20 PM ET**: Lines lock for the week
- **Locked Period**: Thursday night through Sunday 1:00 PM ET
- **Open Period**: Sunday afternoon through Thursday evening

#### Visual Indicators
- 🟢 **Green Badge**: "Lines lock Thursday 8:20 PM ET" (open)
- 🔴 **Red Badge**: "Lines locked for this week" (closed)

## Features

### Real-Time Updates
- Lines update every 60 seconds during open periods
- Projections factor in latest team performance
- Matchup modifiers adjust for weekly news

### FAAB-Only Wagering
- **No real money** involved
- Uses FAAB budget points only
- Commissioner tools for line management
- Transparent settlement system

### Advanced Analytics
- **Upset Percentage**: Calculated from spread magnitude
- **Injury Adjustments**: Built into weekly modifiers  
- **Strength of Schedule**: Factors opponent difficulty
- **Home/Away Simulation**: Accounts for venue advantage

## Example Betting Card

```
Spicy Bijan at Treveyon My Wayward Son
Week 12 • Lines lock Thursday 8:20 PM ET

BETTING LINES
Spread:          Treveyon My Wayward Son -2.5
Over/Under:      247 points
Moneyline:       Treveyon My Wayward Son -130
Upset Chance:    38%

PROJECTED SCORES
Treveyon My Wayward Son: 125
Spicy Bijan:            122

Lines based on weekly projections, injury reports, and matchup analysis.
Beta — FAAB only, no cash
```

## Benefits Over Simple Systems

1. **Accurate Weekly Focus**: Uses current week projections, not season averages
2. **Professional Format**: Standard sportsbook line formatting  
3. **Fair Odds**: Proper vig and upset calculations
4. **Secure Timing**: Thursday lock prevents late-week advantage
5. **Transparent Method**: Clear calculation methodology
6. **Fantasy-Specific**: Tailored for fantasy football scoring patterns

This system provides **Vegas-quality betting lines** specifically designed for fantasy football leagues, ensuring fair and engaging FAAB-based wagering between league members.
