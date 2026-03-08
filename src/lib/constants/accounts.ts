import { Account } from '../types';

export const ACCOUNTS: Account[] = [
  // 資産
  { id: 'asset-cash', name: '現金', type: 'asset', order: 1 },
  { id: 'asset-ordinary-deposit', name: '普通預金', type: 'asset', order: 2 },
  { id: 'asset-checking-deposit', name: '当座預金', type: 'asset', order: 3 },
  { id: 'asset-accounts-receivable', name: '売掛金', type: 'asset', order: 4 },
  { id: 'asset-inventory', name: '棚卸資産', type: 'asset', order: 5 },
  { id: 'asset-prepaid', name: '前払金', type: 'asset', order: 6 },
  { id: 'asset-building', name: '建物', type: 'asset', order: 7 },
  { id: 'asset-building-equipment', name: '建物附属設備', type: 'asset', order: 8 },
  { id: 'asset-vehicle', name: '車両運搬具', type: 'asset', order: 9 },
  { id: 'asset-tools', name: '工具器具備品', type: 'asset', order: 10 },
  { id: 'asset-land', name: '土地', type: 'asset', order: 11 },
  { id: 'asset-owner-loan', name: '事業主貸', type: 'asset', order: 12 },

  // 負債
  { id: 'liability-accounts-payable', name: '買掛金', type: 'liability', order: 20 },
  { id: 'liability-accrued', name: '未払金', type: 'liability', order: 21 },
  { id: 'liability-accrued-expenses', name: '未払費用', type: 'liability', order: 22 },
  { id: 'liability-withholding', name: '預り金', type: 'liability', order: 23 },
  { id: 'liability-borrowing', name: '借入金', type: 'liability', order: 24 },
  { id: 'liability-owner-borrowing', name: '事業主借', type: 'liability', order: 25 },

  // 資本
  { id: 'equity-capital', name: '元入金', type: 'equity', order: 30 },

  // 収益
  { id: 'revenue-sales', name: '売上高', type: 'revenue', order: 40 },
  { id: 'revenue-misc', name: '雑収入', type: 'revenue', order: 41 },
  { id: 'revenue-interest', name: '受取利息', type: 'revenue', order: 42 },

  // 費用
  { id: 'expense-cogs', name: '仕入高', type: 'expense', order: 50 },
  { id: 'expense-tax-public', name: '租税公課', type: 'expense', order: 51 },
  { id: 'expense-packing', name: '荷造運賃', type: 'expense', order: 52 },
  { id: 'expense-utility', name: '水道光熱費', type: 'expense', order: 53 },
  { id: 'expense-travel', name: '旅費交通費', type: 'expense', order: 54 },
  { id: 'expense-telecom', name: '通信費', type: 'expense', order: 55 },
  { id: 'expense-advertising', name: '広告宣伝費', type: 'expense', order: 56 },
  { id: 'expense-entertainment', name: '接待交際費', type: 'expense', order: 57 },
  { id: 'expense-insurance', name: '損害保険料', type: 'expense', order: 58 },
  { id: 'expense-repair', name: '修繕費', type: 'expense', order: 59 },
  { id: 'expense-supplies', name: '消耗品費', type: 'expense', order: 60 },
  { id: 'expense-depreciation', name: '減価償却費', type: 'expense', order: 61 },
  { id: 'expense-welfare', name: '福利厚生費', type: 'expense', order: 62 },
  { id: 'expense-salary', name: '給料賃金', type: 'expense', order: 63 },
  { id: 'expense-outsourcing', name: '外注工賃', type: 'expense', order: 64 },
  { id: 'expense-interest', name: '利子割引料', type: 'expense', order: 65 },
  { id: 'expense-rent', name: '地代家賃', type: 'expense', order: 66 },
  { id: 'expense-bad-debt', name: '貸倒金', type: 'expense', order: 67 },
  { id: 'expense-misc', name: '雑費', type: 'expense', order: 68 },
];

export const ASSET_ACCOUNTS = ACCOUNTS.filter((a) => a.type === 'asset');
export const LIABILITY_ACCOUNTS = ACCOUNTS.filter((a) => a.type === 'liability');
export const EQUITY_ACCOUNTS = ACCOUNTS.filter((a) => a.type === 'equity');
export const REVENUE_ACCOUNTS = ACCOUNTS.filter((a) => a.type === 'revenue');
export const EXPENSE_ACCOUNTS = ACCOUNTS.filter((a) => a.type === 'expense');

export const getAccountById = (id: string): Account | undefined =>
  ACCOUNTS.find((a) => a.id === id);
