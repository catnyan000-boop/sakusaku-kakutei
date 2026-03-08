import { Transaction, TransactionInput, Profile, ProfileInput } from '@/lib/types';

export interface ITransactionRepository {
  getAll(): Promise<Transaction[]>;
  getById(id: string): Promise<Transaction | null>;
  create(input: TransactionInput): Promise<Transaction>;
  bulkCreate(inputs: TransactionInput[]): Promise<Transaction[]>;
  update(id: string, input: Partial<TransactionInput>): Promise<Transaction>;
  delete(id: string): Promise<void>;
  search(params: {
    keyword?: string;
    startDate?: string;
    endDate?: string;
    accountId?: string;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<Transaction[]>;
}

export interface IProfileRepository {
  getProfile(): Promise<Profile | null>;
  createProfile(input: ProfileInput): Promise<Profile>;
  updateProfile(input: Partial<ProfileInput>): Promise<Profile>;
}
