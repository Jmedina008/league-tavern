import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createGeneralThreads, createMatchupThreads } from '@/lib/forum-utils'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  try {
    const { subdomain } = params
    
    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain is required' },
        { status: 400 }
      )
    }
    
    // Find the league
    const league = await prisma.league.findUnique({
      where: { subdomain }
    })
    
    if (!league) {
      return NextResponse.json(
        { error: 'League not found' },
        { status: 404 }
      )
    }
    
    // Create general threads
    await createGeneralThreads(league.id)
    
    // Create matchup threads for current week (you'd make this dynamic)
    const currentWeek = 18 // You'd calculate this from current date or Sleeper API
    await createMatchupThreads(league.id, currentWeek)
    
    return NextResponse.json({
      success: true,
      message: 'Forum threads initialized successfully'
    })
    
  } catch (error) {
    console.error('Error initializing forum threads:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
