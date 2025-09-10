import { Suspense } from 'react';
import { getCurrentWeek } from '@/lib/sleeper';
import BettingContent from '@/components/betting/BettingContent';
import LoadingSpinner from '@/components/LoadingSpinner';

export const metadata = {
  title: 'FAAB Betting | Fantasy Football Hub',
  description: 'Place FAAB bets on weekly matchups with real-time odds and projections',
};

export default async function BettingPage() {
  let currentWeek: number;
  
  try {
    currentWeek = await getCurrentWeek();
  } catch (error) {
    console.error('Error fetching current week:', error);
    currentWeek = 1; // Fallback to week 1
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            FAAB Betting
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Place FAAB bets on weekly matchups. Lines lock every Thursday at 8:20 PM ET.
            Win bets to increase your FAAB budget for waiver wire pickups!
          </p>
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          <BettingContent currentWeek={currentWeek} />
        </Suspense>
      </div>
    </div>
  );
}
