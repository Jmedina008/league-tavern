import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const leagues = await prisma.league.findMany({
      include: {
        commissioner: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            users: true,
            matchups: true,
            chatMessages: true,
            forumThreads: true
          }
        }
      }
    })

    return NextResponse.json({
      leagues: leagues.map(league => ({
        id: league.id,
        name: league.name,
        subdomain: league.subdomain,
        sleeperLeagueId: league.sleeperLeagueId,
        isActive: league.isActive,
        isPremium: league.isPremium,
        commissioner: league.commissioner,
        stats: league._count,
        debugUrl: `/debug/league/${league.subdomain}`,
        chatUrl: `/debug/league/${league.subdomain}/chat`,
        createdAt: league.createdAt
      }))
    })
  } catch (error) {
    console.error('Error fetching leagues:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
