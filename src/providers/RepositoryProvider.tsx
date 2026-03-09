'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ITransactionRepository, IProfileRepository, IKateiAnbunRepository, ITaxSettingsRepository, ITemplateRepository } from '@/lib/repositories/interfaces';
import { SupabaseTransactionRepository } from '@/lib/repositories/supabase/transaction.repository';
import { SupabaseProfileRepository } from '@/lib/repositories/supabase/profile.repository';
import { SupabaseKateiAnbunRepository } from '@/lib/repositories/supabase/katei-anbun.repository';
import { SupabaseTaxSettingsRepository } from '@/lib/repositories/supabase/tax-settings.repository';
import { SupabaseTemplateRepository } from '@/lib/repositories/supabase/template.repository';

interface RepositoryContextValue {
  transactionRepo: ITransactionRepository;
  profileRepo: IProfileRepository;
  kateiAnbunRepo: IKateiAnbunRepository;
  taxSettingsRepo: ITaxSettingsRepository;
  templateRepo: ITemplateRepository;
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
      kateiAnbunRepo: new SupabaseKateiAnbunRepository(supabase),
      taxSettingsRepo: new SupabaseTaxSettingsRepository(supabase),
      templateRepo: new SupabaseTemplateRepository(supabase),
    };
  }, []);

  return (
    <RepositoryContext.Provider value={value}>
      {children}
    </RepositoryContext.Provider>
  );
}
