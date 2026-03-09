// 所得税率（超過累進課税）
export const INCOME_TAX_BRACKETS = [
  { upper: 1_950_000, rate: 0.05, deduction: 0 },
  { upper: 3_300_000, rate: 0.10, deduction: 97_500 },
  { upper: 6_950_000, rate: 0.20, deduction: 427_500 },
  { upper: 9_000_000, rate: 0.23, deduction: 636_000 },
  { upper: 18_000_000, rate: 0.33, deduction: 1_536_000 },
  { upper: 40_000_000, rate: 0.40, deduction: 2_796_000 },
  { upper: Infinity, rate: 0.45, deduction: 4_796_000 },
];

// 復興特別所得税率
export const RECONSTRUCTION_TAX_RATE = 0.021;

// 住民税
export const RESIDENT_TAX_RATE = 0.10;
export const RESIDENT_TAX_FLAT = 5_000;

// 個人事業税
export const BUSINESS_TAX_RATE = 0.05;
export const BUSINESS_TAX_DEDUCTION = 2_900_000;

// デフォルト控除額
export const DEFAULT_BLUE_RETURN_DEDUCTION = 650_000;
export const DEFAULT_BASIC_DEDUCTION = 480_000;
