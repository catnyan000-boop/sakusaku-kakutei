import type { SupabaseClient } from '@supabase/supabase-js';
import { Template, TemplateInput } from '@/lib/types';
import { ITemplateRepository } from '../interfaces';

interface TemplateRow {
  id: string;
  user_id: string;
  name: string;
  debit_account_id: string;
  credit_account_id: string;
  amount: number | null;
  tax_included: boolean;
  description: string;
  created_at: string;
  updated_at: string;
}

function toModel(row: TemplateRow): Template {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    debitAccountId: row.debit_account_id,
    creditAccountId: row.credit_account_id,
    amount: row.amount,
    taxIncluded: row.tax_included,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseTemplateRepository implements ITemplateRepository {
  constructor(private supabase: SupabaseClient) {}

  async getAll(): Promise<Template[]> {
    const { data, error } = await this.supabase
      .from('templates')
      .select('*')
      .order('name');
    if (error) throw error;
    return (data as TemplateRow[] || []).map(toModel);
  }

  async create(input: TemplateInput): Promise<Template> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await this.supabase
      .from('templates')
      .insert({
        user_id: user.id,
        name: input.name,
        debit_account_id: input.debitAccountId,
        credit_account_id: input.creditAccountId,
        amount: input.amount,
        tax_included: input.taxIncluded,
        description: input.description,
      })
      .select()
      .single();
    if (error) throw error;
    return toModel(data as TemplateRow);
  }

  async update(id: string, input: Partial<TemplateInput>): Promise<Template> {
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.name !== undefined) row.name = input.name;
    if (input.debitAccountId !== undefined) row.debit_account_id = input.debitAccountId;
    if (input.creditAccountId !== undefined) row.credit_account_id = input.creditAccountId;
    if (input.amount !== undefined) row.amount = input.amount;
    if (input.taxIncluded !== undefined) row.tax_included = input.taxIncluded;
    if (input.description !== undefined) row.description = input.description;
    const { data, error } = await this.supabase
      .from('templates')
      .update(row)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return toModel(data as TemplateRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('templates')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}
