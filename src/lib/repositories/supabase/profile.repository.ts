import type { SupabaseClient } from '@supabase/supabase-js';
import { Profile, ProfileInput } from '@/lib/types';
import { IProfileRepository } from '../interfaces';

interface ProfileRow {
  id: string;
  full_name: string;
  business_name: string;
  industry: string;
  tax_return_type: string;
  consumption_tax_type: string;
  created_at: string;
  updated_at: string;
}

function toModel(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    businessName: row.business_name,
    industry: row.industry,
    taxReturnType: row.tax_return_type as Profile['taxReturnType'],
    consumptionTaxType: row.consumption_tax_type as Profile['consumptionTaxType'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseProfileRepository implements IProfileRepository {
  constructor(private supabase: SupabaseClient) {}

  async getProfile(): Promise<Profile | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error || !data) return null;
    return toModel(data as ProfileRow);
  }

  async createProfile(input: ProfileInput): Promise<Profile> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await this.supabase
      .from('profiles')
      .insert({
        id: user.id,
        full_name: input.fullName,
        business_name: input.businessName,
        industry: input.industry,
        tax_return_type: input.taxReturnType,
        consumption_tax_type: input.consumptionTaxType,
      })
      .select()
      .single();
    if (error) throw error;
    return toModel(data as ProfileRow);
  }

  async updateProfile(input: Partial<ProfileInput>): Promise<Profile> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const updates: Record<string, unknown> = {};
    if (input.fullName !== undefined) updates.full_name = input.fullName;
    if (input.businessName !== undefined) updates.business_name = input.businessName;
    if (input.industry !== undefined) updates.industry = input.industry;
    if (input.taxReturnType !== undefined) updates.tax_return_type = input.taxReturnType;
    if (input.consumptionTaxType !== undefined) updates.consumption_tax_type = input.consumptionTaxType;
    const { data, error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    return toModel(data as ProfileRow);
  }
}
