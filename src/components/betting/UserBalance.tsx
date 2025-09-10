'use client';

import { DollarSign, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UserBalanceProps {
  balance: number;
}

export default function UserBalance({ balance }: UserBalanceProps) {
  const getBalanceColor = (balance: number) => {
    if (balance >= 80) return 'bg-green-600 text-green-50';
    if (balance >= 50) return 'bg-yellow-600 text-yellow-50';
    if (balance >= 20) return 'bg-orange-600 text-orange-50';
    return 'bg-red-600 text-red-50';
  };

  const getBalanceStatus = (balance: number) => {
    if (balance >= 80) return 'Excellent';
    if (balance >= 50) return 'Good';
    if (balance >= 20) return 'Low';
    return 'Critical';
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <Wallet className="h-5 w-5 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">FAAB Balance:</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Badge className={`${getBalanceColor(balance)} font-mono text-lg px-3 py-1`}>
          ${balance}
        </Badge>
        
        <span className={`text-xs font-medium ${
          balance >= 50 ? 'text-green-600' : 
          balance >= 20 ? 'text-yellow-600' : 
          'text-red-600'
        }`}>
          {getBalanceStatus(balance)}
        </span>
      </div>
    </div>
  );
}
