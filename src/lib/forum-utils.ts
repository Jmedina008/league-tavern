import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function createMatchupThreads(leagueId: string, week: number) {
  try {
    // Get all matchups for this week that don't have threads yet
    const matchups = await prisma.matchup.findMany({
      where: {
        leagueId,
        week,
        forumThreads: {
          none: {} // No forum threads exist for this matchup
        }
      }
    })
    
    // Create forum threads for each matchup
    const createdThreads = []
    
    for (const matchup of matchups) {
      const thread = await prisma.forumThread.create({
        data: {
          leagueId,
          matchupId: matchup.id,
          week,
          title: `Week ${week}: ${matchup.teamAName} vs ${matchup.teamBName}`,
          description: `Game thread for the Week ${week} matchup between ${matchup.teamAName} and ${matchup.teamBName}. Talk trash, make predictions, and discuss the action!`,
          category: 'MATCHUP',
          isPinned: false
        }
      })
      
      createdThreads.push(thread)
    }
    
    return createdThreads
    
  } catch (error) {
    console.error('Error creating matchup threads:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export async function createGeneralThreads(leagueId: string) {
  try {
    const existingGeneral = await prisma.forumThread.findFirst({
      where: {
        leagueId,
        category: 'GENERAL',
        title: 'General Discussion'
      }
    })
    
    if (!existingGeneral) {
      await prisma.forumThread.create({
        data: {
          leagueId,
          title: 'General Discussion',
          description: 'General league discussion, questions, and conversation.',
          category: 'GENERAL',
          isPinned: true
        }
      })
    }
    
    const existingTrash = await prisma.forumThread.findFirst({
      where: {
        leagueId,
        category: 'TRASH_TALK',
        title: 'Trash Talk Central'
      }
    })
    
    if (!existingTrash) {
      await prisma.forumThread.create({
        data: {
          leagueId,
          title: 'Trash Talk Central',
          description: 'Bring your best trash talk, roasts, and friendly banter here!',
          category: 'TRASH_TALK',
          isPinned: true
        }
      })
    }
    
  } catch (error) {
    console.error('Error creating general threads:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}
