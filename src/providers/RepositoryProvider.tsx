'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ITransactionRepository, IProfileRepository } from '@/lib/repositories/interfaces';
import { SupabaseTransactionRepository } from '@/lib/repositories/supabase/transaction.repository';
import { SupabaseProfileRepository } from '@/lib/repositories/supabase/profile.repository';

interface RepositoryContextValue {
  transactionRepo: ITransactionRepository;
  profileRepo: IProfileRepository;
}

const RepositoryContext = createContext<RepositoryContextValue | null>(null);

export function useRepository(): RepositoryContextValue {
  const ctx = useContext(RepositoryContext);
  if (!ctx) throw new Error('useRepository must be used within RepositoryProvider');
  return ctx;
}

export function RepositoryProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(() => {
    const supabase = createClient();
    return {
      transactionRepo: new SupabaseTransactionRepository(supabase),
      profileRepo: new SupabaseProfileRepository(supabase),
    };
  }, []);

  return (
    <RepositoryContext.Provider value={value}>
      {children}
    </RepositoryContext.Provider>
  );
}
