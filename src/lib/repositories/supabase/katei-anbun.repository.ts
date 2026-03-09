import type { SupabaseClient } from '@supabase/supabase-js';
import { KateiAnbun, KateiAnbunInput } from '@/lib/types';
import { IKateiAnbunRepository } from '../interfaces';

interface KateiAnbunRow {
  id: string;
  user_id: string;
  account_id: string;
  business_ratio: number;
  note: string;
  created_at: string;
  updated_at: string;
}

function toModel(row: KateiAnbunRow): KateiAnbun {
  return {
    id: row.id,
    userId: row.user_id,
    accountId: row.account_id,
    businessRatio: row.business_ratio,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseKateiAnbunRepository implements IKateiAnbunRepository {
  constructor(private supabase: SupabaseClient) {}

  async getAll(): Promise<KateiAnbun[]> {
    const { data, error } = await this.supabase
      .from('katei_anbun')
      .select('*')
      .order('account_id');
    if (error) throw error;
    return (data as KateiAnbunRow[] || []).map(toModel);
  }

  async upsert(input: KateiAnbunInput): Promise<KateiAnbun> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await this.supabase
      .from('katei_anbun')
      .upsert(
        {
          user_id: user.id,
          account_id: input.accountId,
          business_ratio: input.businessRatio,
          note: input.note,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,account_id' }
      )
      .select()
      .single();
    if (error) throw error;
    return toModel(data as KateiAnbunRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('katei_anbun')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}
