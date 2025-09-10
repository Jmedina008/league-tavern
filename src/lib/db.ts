import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Betting utility functions
export async function syncUsersFromSleeper(users: any[], rosters: any[]) {
  const rosterById = new Map(rosters.map(r => [r.roster_id, r]))
  
  for (const roster of rosters) {
    const user = users.find(u => u.user_id === roster.owner_id)
    if (!user) continue

    const teamName = roster.metadata?.team_name || user.metadata?.team_name || user.display_name || `Team ${roster.roster_id}`
    const ownerName = user.display_name || "Unknown Owner"

    await prisma.user.upsert({
      where: { rosterId: roster.roster_id },
      update: { teamName, ownerName },
      create: {
        rosterId: roster.roster_id,
        teamName,
        ownerName,
        faabBalance: 100
      }
    })
  }
}

export async function createOrUpdateMatchup(matchupData: {
  week: number
  matchupId: number
  teamAId: number
  teamBId: number
  teamAName: string
  teamBName: string
  spread: number
  overUnder: number
  teamAProj: number
  teamBProj: number
}) {
  return await prisma.matchup.upsert({
    where: { matchupId: matchupData.matchupId },
    update: {
      spread: matchupData.spread,
      overUnder: matchupData.overUnder,
      teamAProj: matchupData.teamAProj,
      teamBProj: matchupData.teamBProj,
    },
    create: matchupData
  })
}

export async function placeBet(betData: {
  userId: string
  matchupId: string
  betType: 'SPREAD' | 'OVER' | 'UNDER' | 'MONEYLINE'
  selection: string
  odds: string
  stake: number
}) {
  return await prisma.$transaction(async (tx) => {
    // Check user's FAAB balance
    const user = await tx.user.findUnique({
      where: { id: betData.userId }
    })
    
    if (!user || user.faabBalance < betData.stake) {
      throw new Error('Insufficient FAAB balance')
    }

    // Create the bet
    const bet = await tx.bet.create({
      data: betData
    })

    // Deduct FAAB (create transaction record)
    await tx.transaction.create({
      data: {
        userId: betData.userId,
        type: 'BET_PLACED',
        amount: -betData.stake,
        description: `Bet placed: ${betData.selection} (${betData.betType})`,
        betId: bet.id
      }
    })

    // Update user balance
    await tx.user.update({
      where: { id: betData.userId },
      data: {
        faabBalance: {
          decrement: betData.stake
        }
      }
    })

    return bet
  })
}

export async function settleBet(betId: string, won: boolean, pushPayout?: number) {
  return await prisma.$transaction(async (tx) => {
    const bet = await tx.bet.findUnique({
      where: { id: betId },
      include: { user: true }
    })

    if (!bet || bet.status !== 'PENDING') {
      throw new Error('Bet not found or already settled')
    }

    let payout = 0
    let status: 'WON' | 'LOST' | 'PUSH' = 'LOST'
    let transactionType: 'BET_WON' | 'BET_LOST' | 'BET_PUSH' = 'BET_LOST'

    if (pushPayout !== undefined) {
      payout = pushPayout
      status = 'PUSH'
      transactionType = 'BET_PUSH'
    } else if (won) {
      // Calculate payout based on odds
      const odds = parseInt(bet.odds)
      if (odds > 0) {
        payout = bet.stake + (bet.stake * (odds / 100))
      } else {
        payout = bet.stake + (bet.stake * (100 / Math.abs(odds)))
      }
      status = 'WON'
      transactionType = 'BET_WON'
    }

    // Update bet
    await tx.bet.update({
      where: { id: betId },
      data: {
        status,
        payout,
        settledAt: new Date()
      }
    })

    // Create transaction and update balance if won or pushed
    if (payout > 0) {
      await tx.transaction.create({
        data: {
          userId: bet.userId,
          type: transactionType,
          amount: Math.round(payout),
          description: `Bet ${status.toLowerCase()}: ${bet.selection}`,
          betId: bet.id
        }
      })

      await tx.user.update({
        where: { id: bet.userId },
        data: {
          faabBalance: {
            increment: Math.round(payout)
          }
        }
      })
    } else {
      // Record the loss
      await tx.transaction.create({
        data: {
          userId: bet.userId,
          type: 'BET_LOST',
          amount: 0,
          description: `Bet lost: ${bet.selection}`,
          betId: bet.id
        }
      })
    }

    return { bet, payout }
  })
}

export async function getUserBettingBalance(rosterId: number) {
  const user = await prisma.user.findUnique({
    where: { rosterId },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' }
      },
      bets: {
        where: { status: 'PENDING' },
        include: { matchup: true }
      }
    }
  })

  return user
}

export async function getWeekBets(week: number) {
  return await prisma.bet.findMany({
    where: {
      matchup: { week }
    },
    include: {
      user: true,
      matchup: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function generateFAABAdjustmentReport(week: number) {
  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { type: 'BET_WON' },
        { type: 'BET_LOST' },
        { type: 'BET_PUSH' }
      ],
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      }
    },
    include: {
      user: true
    },
    orderBy: { createdAt: 'desc' }
  })

  // Group by user
  const adjustments = new Map<number, { teamName: string; ownerName: string; adjustment: number }>()

  for (const transaction of transactions) {
    const rosterId = transaction.user.rosterId
    const existing = adjustments.get(rosterId) || { 
      teamName: transaction.user.teamName, 
      ownerName: transaction.user.ownerName, 
      adjustment: 0 
    }
    existing.adjustment += transaction.amount
    adjustments.set(rosterId, existing)
  }

  return Array.from(adjustments.entries()).map(([rosterId, data]) => ({
    rosterId,
    ...data
  })).filter(adj => adj.adjustment !== 0)
}

// Additional utility functions for new betting interface
export async function syncUsers() {
  // This would normally sync from Sleeper API
  // For now, just ensure we have a default user
  await prisma.user.upsert({
    where: { id: 'user_1' },
    update: {},
    create: {
      id: 'user_1',
      rosterId: 1,
      teamName: 'Demo Team',
      ownerName: 'Demo User',
      faabBalance: 100
    }
  })
}

export async function getUserBalance(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })
  return user?.faabBalance || 100
}

export async function placeBetNew(userId: string, betData: {
  matchupId: string
  betType: 'spread' | 'total' | 'moneyline'
  selection: string
  stake: number
  odds: number
  line?: number
  team?: string
  potentialPayout: number
}) {
  return await prisma.$transaction(async (tx) => {
    // Check user's FAAB balance
    const user = await tx.user.findUnique({
      where: { id: userId }
    })
    
    if (!user || user.faabBalance < betData.stake) {
      throw new Error('Insufficient FAAB balance')
    }

    // Create the bet
    const bet = await tx.bet.create({
      data: {
        userId,
        matchupId: betData.matchupId,
        betType: betData.betType.toUpperCase() as 'SPREAD' | 'TOTAL' | 'MONEYLINE',
        selection: betData.selection,
        odds: betData.odds.toString(),
        stake: betData.stake,
        status: 'PENDING',
        week: 1 // This should be dynamic based on current week
      }
    })

    // Deduct FAAB (create transaction record)
    await tx.transaction.create({
      data: {
        userId,
        type: 'BET_PLACED',
        amount: -betData.stake,
        description: `Bet placed: ${betData.selection} (${betData.betType})`,
        betId: bet.id
      }
    })

    // Update user balance
    await tx.user.update({
      where: { id: userId },
      data: {
        faabBalance: {
          decrement: betData.stake
        }
      }
    })

    return bet
  })
}

export async function getUserBets(userId: string) {
  const bets = await prisma.bet.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      matchup: true
    }
  })

  return bets.map(bet => ({
    id: bet.id,
    matchupId: bet.matchupId,
    betType: bet.betType.toLowerCase(),
    selection: bet.selection,
    stake: bet.stake,
    odds: parseInt(bet.odds),
    potentialPayout: bet.payout || 0,
    status: bet.status,
    placedAt: bet.createdAt.toISOString(),
    settledAt: bet.settledAt?.toISOString(),
    actualPayout: bet.payout,
    week: bet.week || 1
  }))
}
