import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { subdomain } = await request.json()
    
    if (!subdomain || typeof subdomain !== 'string') {
      return NextResponse.json(
        { error: 'Subdomain is required' },
        { status: 400 }
      )
    }
    
    // Check if subdomain already exists
    const existingLeague = await prisma.league.findUnique({
      where: { subdomain }
    })
    
    return NextResponse.json({
      available: !existingLeague,
      subdomain
    })
  } catch (error) {
    console.error('Error checking subdomain:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
