import { NextResponse } from 'next/server';
import { getMatchups, getRosters } from '@/lib/sleeper';
import { generateBettingLines } from '@/lib/betting-engine';

export async function GET(
  request: Request,
  { params }: { params: { week: string } }
) {
  try {
    const week = parseInt(params.week);
    
    if (isNaN(week) || week < 1 || week > 18) {
      return NextResponse.json({ error: 'Invalid week parameter' }, { status: 400 });
    }

    // Fetch current matchups and rosters
    const [matchups, rosters] = await Promise.all([
      getMatchups(week),
      getRosters()
    ]);

    if (!matchups || matchups.length === 0) {
      return NextResponse.json({ 
        lines: [],
        message: 'No matchups available for this week'
      });
    }

    // Generate betting lines using our sophisticated betting engine
    const bettingLines = await generateBettingLines(matchups, rosters, week);

    return NextResponse.json({ 
      lines: bettingLines,
      week,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching betting lines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch betting lines' },
      { status: 500 }
    );
  }
}
