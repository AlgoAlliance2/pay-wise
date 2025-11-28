import { useState, useEffect } from 'react';
import { listenToBudgets } from '@/src/services/budgetService';

export function useBudgets() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenToBudgets((data) => {
      setBudgets(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { budgets, loading };
}