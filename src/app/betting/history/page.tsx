import { Suspense } from 'react';
import BettingHistoryContent from '@/components/betting/BettingHistoryContent';
import LoadingSpinner from '@/components/LoadingSpinner';

export const metadata = {
  title: 'Betting History | Fantasy Football Hub',
  description: 'View your complete FAAB betting history and track your performance',
};

export default function BettingHistoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Betting History
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Track your FAAB betting performance, view pending bets, and analyze your betting patterns.
          </p>
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          <BettingHistoryContent />
        </Suspense>
      </div>
    </div>
  );
}
