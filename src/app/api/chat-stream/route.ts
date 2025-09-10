import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Store active connections
const connections = new Map<string, { 
  controller: ReadableStreamDefaultController, 
  userId: string, 
  leagueId: string 
}>()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const subdomain = searchParams.get('subdomain')
  const userId = searchParams.get('userId')
  
  if (!subdomain || !userId) {
    return new Response('Missing parameters', { status: 400 })
  }
  
  // Find league
  const league = await prisma.league.findUnique({
    where: { subdomain }
  })
  
  if (!league) {
    return new Response('League not found', { status: 404 })
  }
  
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    start(controller) {
      // Store this connection
      const connectionId = `${userId}-${Date.now()}`
      connections.set(connectionId, { controller, userId, leagueId: league.id })
      
      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
        type: 'connected',
        message: 'Connected to chat'
      })}\n\n`))
      
      // Send current online users
      broadcastOnlineUsers(league.id)
      
      // Clean up on close
      request.signal.addEventListener('abort', () => {
        connections.delete(connectionId)
        broadcastOnlineUsers(league.id)
      })
    }
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const { subdomain, userId, content } = await request.json()
    
    if (!subdomain || !userId || !content) {
      return new Response('Missing parameters', { status: 400 })
    }
    
    // Find league and user
    const [league, user] = await Promise.all([
      prisma.league.findUnique({ where: { subdomain } }),
      prisma.user.findUnique({ where: { id: userId } })
    ])
    
    if (!league || !user) {
      return new Response('League or user not found', { status: 404 })
    }
    
    // Create message
    const message = await prisma.chatMessage.create({
      data: {
        leagueId: league.id,
        userId: userId,
        content: content.trim()
      },
      include: {
        user: {
          select: {
            teamName: true,
            ownerName: true,
            sleeperUsername: true
          }
        }
      }
    })
    
    // Broadcast message to all connected users in this league
    broadcastMessage(league.id, message)
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Error posting message:', error)
    return new Response('Internal server error', { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

function broadcastMessage(leagueId: string, message: any) {
  const encoder = new TextEncoder()
  const data = encoder.encode(`data: ${JSON.stringify({
    type: 'message',
    message
  })}\n\n`)
  
  for (const [connectionId, connection] of connections.entries()) {
    if (connection.leagueId === leagueId) {
      try {
        connection.controller.enqueue(data)
      } catch (error) {
        // Connection closed, remove it
        connections.delete(connectionId)
      }
    }
  }
}

async function broadcastOnlineUsers(leagueId: string) {
  try {
    // Get unique user IDs for this league
    const activeUserIds = new Set<string>()
    for (const connection of connections.values()) {
      if (connection.leagueId === leagueId) {
        activeUserIds.add(connection.userId)
      }
    }
    
    // Get user details
    const users = await prisma.user.findMany({
      where: {
        id: { in: Array.from(activeUserIds) }
      },
      select: {
        id: true,
        teamName: true,
        ownerName: true,
        sleeperUsername: true,
        isOnline: true
      }
    })
    
    const encoder = new TextEncoder()
    const data = encoder.encode(`data: ${JSON.stringify({
      type: 'users',
      users
    })}\n\n`)
    
    for (const [connectionId, connection] of connections.entries()) {
      if (connection.leagueId === leagueId) {
        try {
          connection.controller.enqueue(data)
        } catch (error) {
          connections.delete(connectionId)
        }
      }
    }
  } catch (error) {
    console.error('Error broadcasting online users:', error)
  } finally {
    await prisma.$disconnect()
  }
}
