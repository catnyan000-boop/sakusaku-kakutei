import type { SupabaseClient } from '@supabase/supabase-js';
import { TaxSettings, TaxSettingsInput } from '@/lib/types';
import { ITaxSettingsRepository } from '../interfaces';

interface TaxSettingsRow {
  id: string;
  user_id: string;
  fiscal_year_start: string;
  tax_method: string;
  simplified_business_type: number | null;
  basic_deduction: number;
  social_insurance: number;
  life_insurance: number;
  earthquake_insurance: number;
  spouse_deduction: number;
  dependents_deduction: number;
  other_deduction: number;
  blue_return_deduction: number;
  created_at: string;
  updated_at: string;
}

function toModel(row: TaxSettingsRow): TaxSettings {
  return {
    id: row.id,
    userId: row.user_id,
    fiscalYearStart: row.fiscal_year_start,
    taxMethod: row.tax_method as TaxSettings['taxMethod'],
    simplifiedBusinessType: row.simplified_business_type,
    basicDeduction: row.basic_deduction,
    socialInsurance: row.social_insurance,
    lifeInsurance: row.life_insurance,
    earthquakeInsurance: row.earthquake_insurance,
    spouseDeduction: row.spouse_deduction,
    dependentsDeduction: row.dependents_deduction,
    otherDeduction: row.other_deduction,
    blueReturnDeduction: row.blue_return_deduction,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseTaxSettingsRepository implements ITaxSettingsRepository {
  constructor(private supabase: SupabaseClient) {}

  async get(): Promise<TaxSettings | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await this.supabase
      .from('tax_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (error || !data) return null;
    return toModel(data as TaxSettingsRow);
  }

  async upsert(input: TaxSettingsInput): Promise<TaxSettings> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const row: Record<string, unknown> = {
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };
    if (input.basicDeduction !== undefined) row.basic_deduction = input.basicDeduction;
    if (input.socialInsurance !== undefined) row.social_insurance = input.socialInsurance;
    if (input.lifeInsurance !== undefined) row.life_insurance = input.lifeInsurance;
    if (input.earthquakeInsurance !== undefined) row.earthquake_insurance = input.earthquakeInsurance;
    if (input.spouseDeduction !== undefined) row.spouse_deduction = input.spouseDeduction;
    if (input.dependentsDeduction !== undefined) row.dependents_deduction = input.dependentsDeduction;
    if (input.otherDeduction !== undefined) row.other_deduction = input.otherDeduction;
    if (input.blueReturnDeduction !== undefined) row.blue_return_deduction = input.blueReturnDeduction;

    const { data, error } = await this.supabase
      .from('tax_settings')
      .upsert(row, { onConflict: 'user_id' })
      .select()
      .single();
    if (error) throw error;
    return toModel(data as TaxSettingsRow);
  }
}
