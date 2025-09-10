# FAAB Betting System - Commissioner Guide

## Overview
Since the Sleeper API doesn't allow direct FAAB manipulation, this system tracks all betting activity in a separate database and provides you with clear reports for manual FAAB adjustments in Sleeper.

## How It Works

### 1. **User Registration & Sync**
- The system automatically syncs users from your Sleeper league
- Each user starts with a 100 FAAB balance in the betting system
- User data updates automatically when you visit the admin dashboard

### 2. **Weekly Betting Flow**

#### Monday-Wednesday (Lines Open)
- Betting lines are generated based on weekly projections
- Users can place bets on spreads, over/under, and moneylines
- All bets are tracked in the database with FAAB deductions

#### Thursday 8:20 PM ET (Lines Lock)
- Lines automatically lock before Thursday Night Football
- No new bets can be placed until after the weekend

#### Sunday-Monday (Settlement)
- You manually settle bets based on actual matchup results
- System calculates winnings/losses automatically
- FAAB adjustments are recorded for export

### 3. **Commissioner Workflow**

#### Daily Management
1. **Check Dashboard**: Visit `/admin` to monitor betting activity
2. **Review Balances**: Ensure users have sufficient FAAB for bets
3. **Monitor Activity**: Track weekly betting volume and popular bets

#### Weekly Settlement (Monday/Tuesday)
1. **Visit Admin Dashboard** (`/admin`)
2. **Review Week Results**: Check all completed matchups
3. **Settle Bets**: Use settlement tools to mark bets as won/lost
4. **Export FAAB Report**: Download CSV with required adjustments
5. **Update Sleeper**: Manually adjust FAAB in Sleeper based on report

## Step-by-Step Settlement Process

### Step 1: Access Admin Dashboard
Navigate to: `yoursite.com/admin`

You'll see:
- Total FAAB in system
- Number of active bets
- User balances
- Recent betting activity

### Step 2: Review Week Results
Check the "Week X Bets" section to see all pending bets that need settlement.

### Step 3: Export FAAB Adjustments
1. Click **"Export Adjustments"** button
2. Download the CSV file (format: `faab-adjustments-YYYY-MM-DD.csv`)
3. Open the CSV to see required Sleeper adjustments

### Step 4: Update Sleeper FAAB
**In Sleeper App:**
1. Go to League → League Settings → FAAB Budgets
2. For each user in the CSV:
   - Find their team
   - Adjust their FAAB by the "FAAB Adjustment" amount
   - **Positive numbers** = add FAAB (they won bets)
   - **Negative numbers** = subtract FAAB (they lost bets)

### Example CSV Output
```csv
Roster ID,Team Name,Owner Name,FAAB Adjustment,Notes
1234567,"Team Thunder","John Smith",+15,"Betting winnings/losses"
2345678,"Lightning Bolts","Jane Doe",-5,"Betting winnings/losses"
3456789,"Storm Chasers","Mike Johnson",-10,"Betting winnings/losses"
```

## Database Schema

### Users Table
- Tracks each league member's betting balance
- Syncs with Sleeper roster data
- Records all transaction history

### Matchups Table
- Stores weekly betting lines and projections
- Tracks settlement status
- Records final scores for bet resolution

### Bets Table
- Individual bet records with stakes and selections
- Status tracking (PENDING/WON/LOST/PUSH)
- Automatic payout calculations

### Transactions Table
- Complete audit trail of all FAAB movements
- Links to specific bets for transparency
- Provides historical betting analysis

## Security & Fairness

### Line Locking
- Lines lock Thursday 8:20 PM ET automatically
- Prevents late-week betting advantages
- Visual indicators show lock status to users

### Transparent Tracking
- All bets recorded with timestamps
- Complete transaction history available
- CSV exports provide audit trail

### FAAB Validation
- System prevents overbetting (insufficient FAAB)
- Real-time balance tracking
- Automatic transaction recording

## Troubleshooting

### Common Issues

#### "Insufficient FAAB Balance"
- User's betting balance is too low
- Check admin dashboard for current balance
- May need manual FAAB adjustment in system

#### Bet Settlement Questions
- Reference the matchup results in Sleeper
- Use actual final scores for over/under bets
- Spreads are based on projected score difference

#### CSV Export Problems
- Ensure you're settling bets before exporting
- Check that the current week has completed games
- Verify database connection is working

### Manual Adjustments
If you need to manually adjust someone's betting balance:
1. Go to admin dashboard
2. Use FAAB Adjustments tool
3. Add transaction with reason (e.g., "Commissioner correction")

## Best Practices

### Weekly Routine
1. **Monday**: Settle previous week's bets
2. **Tuesday**: Export and apply FAAB adjustments in Sleeper
3. **Wednesday**: Review new week's lines and user balances
4. **Thursday**: Monitor final betting activity before lock
5. **Sunday**: Track game results for settlement

### Communication
- Announce line lock times to league
- Share betting results weekly
- Provide CSV export summary to league for transparency

### Season Management
- Set betting season dates (e.g., Weeks 1-17)
- Consider playoff betting rules
- Plan year-end settlement process

## Technical Notes

### Database Backup
The system uses SQLite (`dev.db` file). Back this up regularly to preserve betting history.

### Performance
- System auto-syncs users when admin visits dashboard
- Lines update every 60 seconds when unlocked
- Database queries are optimized for quick response

### Integration
- Works alongside existing Fantasy Hub features
- No interference with Sleeper API usage
- Maintains separate betting ledger system

This system provides **professional betting management** while working within Sleeper's API limitations, giving you complete control over the FAAB betting experience.
