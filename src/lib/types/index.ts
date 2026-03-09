// --- Account ---

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  order: number;
}

// --- Profile ---

export interface Profile {
  id: string;
  fullName: string;
  businessName: string;
  industry: string;
  taxReturnType: 'blue' | 'white';
  consumptionTaxType: 'exempt' | 'simplified' | 'standard';
  createdAt: string;
  updatedAt: string;
}

export interface ProfileInput {
  fullName: string;
  businessName: string;
  industry: string;
  taxReturnType: 'blue' | 'white';
  consumptionTaxType: 'exempt' | 'simplified' | 'standard';
}

// --- Transaction ---

export interface Transaction {
  id: string;
  userId: string;
  date: string;
  debitAccountId: string;
  creditAccountId: string;
  amount: number;
  taxIncluded: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionInput {
  date: string;
  debitAccountId: string;
  creditAccountId: string;
  amount: number;
  taxIncluded: boolean;
  description: string;
}

// --- Reports ---

export interface TrialBalanceRow {
  accountId: string;
  accountName: string;
  accountType: AccountType;
  debit: number;
  credit: number;
}

export interface TrialBalance {
  rows: TrialBalanceRow[];
  totalDebit: number;
  totalCredit: number;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  expense: number;
  profit: number;
}

// --- Katei Anbun ---

export interface KateiAnbun {
  id: string;
  userId: string;
  accountId: string;
  businessRatio: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface KateiAnbunInput {
  accountId: string;
  businessRatio: number;
  note: string;
}

// --- Template ---

export interface Template {
  id: string;
  userId: string;
  name: string;
  debitAccountId: string;
  creditAccountId: string;
  amount: number | null;
  taxIncluded: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// --- Tax Settings ---

export interface TaxSettings {
  id: string;
  userId: string;
  fiscalYearStart: string;
  taxMethod: 'exempt' | 'simplified' | 'standard';
  simplifiedBusinessType: number | null;
  basicDeduction: number;
  socialInsurance: number;
  lifeInsurance: number;
  earthquakeInsurance: number;
  spouseDeduction: number;
  dependentsDeduction: number;
  otherDeduction: number;
  blueReturnDeduction: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaxSettingsInput {
  basicDeduction?: number;
  socialInsurance?: number;
  lifeInsurance?: number;
  earthquakeInsurance?: number;
  spouseDeduction?: number;
  dependentsDeduction?: number;
  otherDeduction?: number;
  blueReturnDeduction?: number;
}

// --- Report Types ---

export interface PLRow {
  accountId: string;
  accountName: string;
  rawAmount: number;
  businessRatio: number;
  adjustedAmount: number;
}

export interface PLReport {
  revenueRows: PLRow[];
  costRow: PLRow | null;
  expenseRows: PLRow[];
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  totalExpense: number;
  profit: number;
}

export interface BSRow {
  accountId: string;
  accountName: string;
  amount: number;
}

export interface BSReport {
  assetRows: BSRow[];
  liabilityRows: BSRow[];
  equityRows: BSRow[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

export interface MonthlyTableRow {
  month: string;
  revenue: number;
  cost: number;
  expense: number;
  profit: number;
}

export interface TaxEstimate {
  businessIncome: number;
  blueReturnDeduction: number;
  taxableBusinessIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  incomeTax: number;
  reconstructionTax: number;
  residentTax: number;
  businessTax: number;
  totalTax: number;
}

// --- CSV Import ---

export interface CsvImport {
  id: string;
  userId: string;
  fileName: string;
  rowCount: number;
  importedAt: string;
}
