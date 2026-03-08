import { Transaction, TrialBalance, TrialBalanceRow, MonthlyData } from '../types';
import { ACCOUNTS, getAccountById } from '../constants/accounts';

export function generateTrialBalance(transactions: Transaction[]): TrialBalance {
  const accountTotals = new Map<string, { debit: number; credit: number }>();

  for (const tx of transactions) {
    // Debit side
    if (!accountTotals.has(tx.debitAccountId)) {
      accountTotals.set(tx.debitAccountId, { debit: 0, credit: 0 });
    }
    accountTotals.get(tx.debitAccountId)!.debit += tx.amount;

    // Credit side
    if (!accountTotals.has(tx.creditAccountId)) {
      accountTotals.set(tx.creditAccountId, { debit: 0, credit: 0 });
    }
    accountTotals.get(tx.creditAccountId)!.credit += tx.amount;
  }

  const rows: TrialBalanceRow[] = [];
  let totalDebit = 0;
  let totalCredit = 0;

  for (const account of ACCOUNTS) {
    const totals = accountTotals.get(account.id);
    if (!totals) continue;
    if (totals.debit === 0 && totals.credit === 0) continue;

    rows.push({
      accountId: account.id,
      accountName: account.name,
      accountType: account.type,
      debit: totals.debit,
      credit: totals.credit,
    });

    totalDebit += totals.debit;
    totalCredit += totals.credit;
  }

  return { rows, totalDebit, totalCredit };
}

export function generateMonthlyData(transactions: Transaction[]): MonthlyData[] {
  const monthMap = new Map<string, { revenue: number; expense: number }>();

  for (const tx of transactions) {
    const month = tx.date.slice(0, 7); // YYYY-MM
    if (!monthMap.has(month)) {
      monthMap.set(month, { revenue: 0, expense: 0 });
    }
    const data = monthMap.get(month)!;

    // Credit to revenue account = revenue
    const creditAccount = getAccountById(tx.creditAccountId);
    if (creditAccount?.type === 'revenue') {
      data.revenue += tx.amount;
    }

    // Debit to expense account = expense
    const debitAccount = getAccountById(tx.debitAccountId);
    if (debitAccount?.type === 'expense') {
      data.expense += tx.amount;
    }
  }

  const months = Array.from(monthMap.keys()).sort();
  return months.map((month) => {
    const data = monthMap.get(month)!;
    return {
      month,
      revenue: data.revenue,
      expense: data.expense,
      profit: data.revenue - data.expense,
    };
  });
}
