import { useState, useEffect } from 'react';
import { listenToAccounts } from '@/src/services/accountService';

export function useAccounts() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenToAccounts((data) => {
      setAccounts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { accounts, loading };
}