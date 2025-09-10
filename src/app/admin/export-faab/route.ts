import { NextResponse } from 'next/server'
import { generateFAABAdjustmentReport } from '../../../../lib/db'

export async function GET() {
  try {
    // Handle case where database might not exist during build
    let adjustments = []
    
    try {
      adjustments = await generateFAABAdjustmentReport(1) // Current week
    } catch (dbError) {
      console.warn('Database not available during build, returning empty report')
      // Return empty CSV during build time
      adjustments = []
    }
    
    // Create CSV content
    const csvHeaders = 'Roster ID,Team Name,Owner Name,FAAB Adjustment,Notes\n'
    const csvRows = adjustments.map(adj => 
      `${adj.rosterId},"${adj.teamName}","${adj.ownerName}",${adj.adjustment},"Betting winnings/losses"`
    ).join('\n')
    
    const csvContent = csvHeaders + csvRows
    
    // Create filename with current date
    const date = new Date().toISOString().split('T')[0]
    const filename = `faab-adjustments-${date}.csv`
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('Error generating FAAB export:', error)
    return NextResponse.json(
      { error: 'Failed to generate FAAB adjustments export' },
      { status: 500 }
    )
  }
}
