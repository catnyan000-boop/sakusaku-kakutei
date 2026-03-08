import type { SupabaseClient } from '@supabase/supabase-js';
import { Transaction, TransactionInput } from '@/lib/types';
import { ITransactionRepository } from '../interfaces';

interface TransactionRow {
  id: string;
  user_id: string;
  date: string;
  debit_account_id: string;
  credit_account_id: string;
  amount: number;
  tax_included: boolean;
  description: string;
  created_at: string;
  updated_at: string;
}

function toModel(row: TransactionRow): Transaction {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    debitAccountId: row.debit_account_id,
    creditAccountId: row.credit_account_id,
    amount: row.amount,
    taxIncluded: row.tax_included,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseTransactionRepository implements ITransactionRepository {
  constructor(private supabase: SupabaseClient) {}

  async getAll(): Promise<Transaction[]> {
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return (data as TransactionRow[] || []).map(toModel);
  }

  async getById(id: string): Promise<Transaction | null> {
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return toModel(data as TransactionRow);
  }

  async create(input: TransactionInput): Promise<Transaction> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await this.supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        date: input.date,
        debit_account_id: input.debitAccountId,
        credit_account_id: input.creditAccountId,
        amount: input.amount,
        tax_included: input.taxIncluded,
        description: input.description,
      })
      .select()
      .single();
    if (error) throw error;
    return toModel(data as TransactionRow);
  }

  async bulkCreate(inputs: TransactionInput[]): Promise<Transaction[]> {
    if (inputs.length === 0) return [];
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const rows = inputs.map((input) => ({
      user_id: user.id,
      date: input.date,
      debit_account_id: input.debitAccountId,
      credit_account_id: input.creditAccountId,
      amount: input.amount,
      tax_included: input.taxIncluded,
      description: input.description,
    }));
    const { data, error } = await this.supabase
      .from('transactions')
      .insert(rows)
      .select();
    if (error) throw error;
    return (data as TransactionRow[] || []).map(toModel);
  }

  async update(id: string, input: Partial<TransactionInput>): Promise<Transaction> {
    const row: Record<string, unknown> = {};
    if (input.date !== undefined) row.date = input.date;
    if (input.debitAccountId !== undefined) row.debit_account_id = input.debitAccountId;
    if (input.creditAccountId !== undefined) row.credit_account_id = input.creditAccountId;
    if (input.amount !== undefined) row.amount = input.amount;
    if (input.taxIncluded !== undefined) row.tax_included = input.taxIncluded;
    if (input.description !== undefined) row.description = input.description;
    row.updated_at = new Date().toISOString();
    const { data, error } = await this.supabase
      .from('transactions')
      .update(row)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return toModel(data as TransactionRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  async search(params: {
    keyword?: string;
    startDate?: string;
    endDate?: string;
    accountId?: string;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<Transaction[]> {
    let query = this.supabase.from('transactions').select('*');
    if (params.keyword) query = query.ilike('description', `%${params.keyword}%`);
    if (params.startDate) query = query.gte('date', params.startDate);
    if (params.endDate) query = query.lte('date', params.endDate);
    if (params.accountId) {
      query = query.or(`debit_account_id.eq.${params.accountId},credit_account_id.eq.${params.accountId}`);
    }
    if (params.minAmount !== undefined) query = query.gte('amount', params.minAmount);
    if (params.maxAmount !== undefined) query = query.lte('amount', params.maxAmount);
    query = query.order('date', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    return (data as TransactionRow[] || []).map(toModel);
  }
}
