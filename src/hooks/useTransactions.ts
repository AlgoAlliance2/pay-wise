import { useState, useEffect } from 'react';
import { listenToTransactions } from '@/src/services/transactionService';

export function useTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Start listening when the component mounts
    const unsubscribe = listenToTransactions((data) => {
      setTransactions(data);
      setLoading(false);
    });

    // Stop listening when the component unmounts (cleanup)
    return () => unsubscribe();
  }, []);

  return { transactions, loading };
}