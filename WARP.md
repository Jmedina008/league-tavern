# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Fantasy Hub is a Next.js 15 application that serves as a comprehensive fantasy football league management platform. It integrates with the Sleeper API to provide advanced features like betting systems, league management, and team analytics.

### Tech Stack
- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript with strict mode
- **Database**: SQLite with Prisma ORM  
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives (Progress, Slot, Tabs)
- **Icons**: Lucide React
- **Notifications**: Sonner

## Architecture Overview

### Database Schema (`prisma/schema.prisma`)
The application uses a sophisticated multi-tenant architecture supporting multiple fantasy leagues:

- **Multi-tenant design**: Each league operates as a separate tenant with subdomain support
- **Core entities**: Leagues, Commissioners, Users, Matchups, Bets, Transactions
- **Advanced betting system**: Supports spread, over/under, moneyline betting with FAAB integration
- **Social features**: Chat messages, forum threads, and posts for community engagement

### Key Components

**Database Layer** (`lib/db.ts`):
- Prisma client singleton with development-friendly global instance
- Comprehensive betting utilities: `placeBet()`, `settleBet()`, `getUserBalance()`
- Sleeper API sync functions: `syncUsersFromSleeper()`, `createOrUpdateMatchup()`
- FAAB (Free Agent Acquisition Budget) transaction management

**Betting Engine** (`lib/betting-engine.ts`):
- Sophisticated odds calculation algorithm based on team projections
- Multiple betting types: spread, totals, moneyline
- Advanced projection system considering:
  - Week-based adjustments (early season mean reversion, playoff boosts)
  - Positional strength analysis
  - Team balance scoring for reliability metrics
- Industry-standard odds conversion from implied probabilities

**Frontend Structure** (`src/app/`):
- **Route-based pages**: `/admin`, `/betting`, `/commissioner`, `/leagues`, `/news`, `/odds`, `/rankings`, `/scores`, `/standings`, `/teams`
- **NFL.com-inspired design**: Professional sports media layout with live scores ticker, headlines rail, and featured content
- **Server-side rendering**: All main pages are server components with ISR (revalidate: 60s)

## Common Development Commands

### Development
```bash
# Start development server with Turbopack
npm run dev

# Build for production with Turbopack
npm run build

# Start production server  
npm start

# Run ESLint
npm run lint
```

### Database Operations
```bash
# Generate Prisma client after schema changes
npx prisma generate

# Apply database migrations  
npx prisma db push

# Open Prisma Studio for database inspection
npx prisma studio

# Reset database (development only)
npx prisma db push --force-reset
```

### Testing Individual Components
Since this uses App Router, test individual pages by navigating to:
- `/debug` - Debug utilities and data inspection
- `/admin` - Administrative functions
- `/betting` - Betting interface testing
- `/odds` - Odds calculation verification

## Development Environment Setup

1. **Environment Variables**: 
   - `DATABASE_URL` - SQLite database path
   - `LEAGUE_ID` - Default Sleeper league ID (fallback: "1180507846524702720")
   - `NEXT_PUBLIC_SITE_NAME` - League branding name

2. **Database Setup**:
   ```bash
   # Initialize database and run migrations
   npx prisma db push
   
   # Seed with demo data (if seeder exists)
   npx prisma db seed
   ```

## Key Integration Points

### Sleeper API Integration
The app heavily integrates with Sleeper's REST API (`https://api.sleeper.app/v1`):
- User and roster synchronization
- Live matchup data fetching  
- Transaction history tracking
- Real-time scoring updates

### Betting System Workflow
1. **Line Generation**: `betting-engine.ts` creates sophisticated betting lines using projection algorithms
2. **Bet Placement**: FAAB-based stakes with balance validation
3. **Settlement**: Automated payout calculation based on American odds format
4. **Reporting**: Comprehensive transaction logs and balance adjustments

## Architecture Patterns

**Server Components First**: All main pages are server components with strategic client component usage
**Database Transactions**: Critical operations (betting, settlements) use Prisma transactions for data consistency  
**Type Safety**: Comprehensive TypeScript usage with strict configuration
**API Design**: RESTful patterns following Sleeper API conventions
**Error Handling**: Build-time error bypassing for rapid development (disabled ESLint and TypeScript errors)

## Multi-Tenant Considerations

When working on league-specific features:
- Always scope database queries by `leagueId`
- Consider subdomain routing implications
- Test with multiple league configurations
- Validate commissioner permissions vs regular user permissions

## Performance Notes

- **Turbopack**: Used for both dev and build for improved performance
- **ISR**: 60-second revalidation on data-heavy pages
- **Database**: SQLite for simplicity, consider PostgreSQL for production multi-tenant deployment
- **Client-side state**: Minimal use, prefer server-side data fetching
