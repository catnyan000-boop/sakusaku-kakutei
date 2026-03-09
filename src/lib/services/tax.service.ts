import { TaxEstimate } from '../types';
import {
  INCOME_TAX_BRACKETS,
  RECONSTRUCTION_TAX_RATE,
  RESIDENT_TAX_RATE,
  RESIDENT_TAX_FLAT,
  BUSINESS_TAX_RATE,
  BUSINESS_TAX_DEDUCTION,
} from '../constants/tax';

export function calculateIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  for (const bracket of INCOME_TAX_BRACKETS) {
    if (taxableIncome <= bracket.upper) {
      return Math.floor(taxableIncome * bracket.rate - bracket.deduction);
    }
  }
  return 0;
}

export function calculateTaxEstimate(
  revenue: number,
  expenseAfterAnbun: number,
  blueReturnDeduction: number,
  deductions: {
    basicDeduction: number;
    socialInsurance: number;
    lifeInsurance: number;
    earthquakeInsurance: number;
    spouseDeduction: number;
    dependentsDeduction: number;
    otherDeduction: number;
  },
): TaxEstimate {
  const businessIncome = revenue - expenseAfterAnbun;
  const taxableBusinessIncome = Math.max(0, businessIncome - blueReturnDeduction);

  const totalDeductions =
    deductions.basicDeduction +
    deductions.socialInsurance +
    deductions.lifeInsurance +
    deductions.earthquakeInsurance +
    deductions.spouseDeduction +
    deductions.dependentsDeduction +
    deductions.otherDeduction;

  const taxableIncome = Math.max(0, taxableBusinessIncome - totalDeductions);
  const incomeTax = calculateIncomeTax(taxableIncome);
  const reconstructionTax = Math.floor(incomeTax * RECONSTRUCTION_TAX_RATE);
  const residentTax = taxableIncome > 0
    ? Math.floor(taxableIncome * RESIDENT_TAX_RATE) + RESIDENT_TAX_FLAT
    : 0;
  const businessTax = Math.max(0, Math.floor((taxableBusinessIncome - BUSINESS_TAX_DEDUCTION) * BUSINESS_TAX_RATE));
  const totalTax = incomeTax + reconstructionTax + residentTax + businessTax;

  return {
    businessIncome,
    blueReturnDeduction,
    taxableBusinessIncome,
    totalDeductions,
    taxableIncome,
    incomeTax,
    reconstructionTax,
    residentTax,
    businessTax,
    totalTax,
  };
}
