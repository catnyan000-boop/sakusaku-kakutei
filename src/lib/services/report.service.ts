import { Transaction, TrialBalance, TrialBalanceRow, MonthlyData, PLRow, PLReport, BSRow, BSReport, MonthlyTableRow } from '../types';
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

/**
 * 損益計算書を生成（家事按分反映）
 */
export function generatePL(
  transactions: Transaction[],
  kateiAnbunMap: Map<string, number>,
): PLReport {
  const accountTotals = new Map<string, number>();

  for (const tx of transactions) {
    const debitAcc = getAccountById(tx.debitAccountId);
    if (debitAcc && (debitAcc.type === 'expense' || debitAcc.id === 'expense-cogs')) {
      accountTotals.set(tx.debitAccountId, (accountTotals.get(tx.debitAccountId) || 0) + tx.amount);
    }
    const creditAcc = getAccountById(tx.creditAccountId);
    if (creditAcc?.type === 'revenue') {
      accountTotals.set(tx.creditAccountId, (accountTotals.get(tx.creditAccountId) || 0) + tx.amount);
    }
  }

  const revenueRows: PLRow[] = [];
  let costRow: PLRow | null = null;
  const expenseRows: PLRow[] = [];

  for (const account of ACCOUNTS) {
    const raw = accountTotals.get(account.id);
    if (!raw) continue;
    const ratio = kateiAnbunMap.get(account.id) ?? 100;
    const adjusted = Math.floor(raw * ratio / 100);

    const row: PLRow = {
      accountId: account.id,
      accountName: account.name,
      rawAmount: raw,
      businessRatio: ratio,
      adjustedAmount: adjusted,
    };

    if (account.type === 'revenue') {
      revenueRows.push(row);
    } else if (account.id === 'expense-cogs') {
      costRow = row;
    } else if (account.type === 'expense') {
      expenseRows.push(row);
    }
  }

  const totalRevenue = revenueRows.reduce((s, r) => s + r.adjustedAmount, 0);
  const totalCost = costRow?.adjustedAmount || 0;
  const grossProfit = totalRevenue - totalCost;
  const totalExpense = expenseRows.reduce((s, r) => s + r.adjustedAmount, 0);
  const profit = grossProfit - totalExpense;

  return { revenueRows, costRow, expenseRows, totalRevenue, totalCost, grossProfit, totalExpense, profit };
}

/**
 * 貸借対照表を生成
 */
export function generateBS(transactions: Transaction[]): BSReport {
  const tb = generateTrialBalance(transactions);
  const assetRows: BSRow[] = [];
  const liabilityRows: BSRow[] = [];
  const equityRows: BSRow[] = [];

  for (const row of tb.rows) {
    const account = getAccountById(row.accountId);
    if (!account) continue;
    let amount = 0;
    if (account.type === 'asset') {
      amount = row.debit - row.credit;
    } else if (account.type === 'liability') {
      amount = row.credit - row.debit;
    } else if (account.type === 'equity') {
      amount = row.credit - row.debit;
    } else {
      continue;
    }
    if (amount === 0) continue;

    const bsRow: BSRow = { accountId: account.id, accountName: account.name, amount };
    if (account.type === 'asset') assetRows.push(bsRow);
    else if (account.type === 'liability') liabilityRows.push(bsRow);
    else equityRows.push(bsRow);
  }

  const totalAssets = assetRows.reduce((s, r) => s + r.amount, 0);
  const totalLiabilities = liabilityRows.reduce((s, r) => s + r.amount, 0);
  const totalEquity = equityRows.reduce((s, r) => s + r.amount, 0);

  return { assetRows, liabilityRows, equityRows, totalAssets, totalLiabilities, totalEquity };
}

/**
 * 月別集計表を生成（指定年の1月〜12月）
 */
export function generateMonthlyTable(transactions: Transaction[], year: number): MonthlyTableRow[] {
  const monthMap = new Map<string, { revenue: number; cost: number; expense: number }>();
  for (let m = 1; m <= 12; m++) {
    monthMap.set(String(m).padStart(2, '0'), { revenue: 0, cost: 0, expense: 0 });
  }

  for (const tx of transactions) {
    if (!tx.date.startsWith(String(year))) continue;
    const month = tx.date.slice(5, 7);
    const data = monthMap.get(month);
    if (!data) continue;

    const creditAcc = getAccountById(tx.creditAccountId);
    if (creditAcc?.type === 'revenue') data.revenue += tx.amount;

    const debitAcc = getAccountById(tx.debitAccountId);
    if (debitAcc?.id === 'expense-cogs') {
      data.cost += tx.amount;
    } else if (debitAcc?.type === 'expense') {
      data.expense += tx.amount;
    }
  }

  return Array.from(monthMap.entries()).map(([month, d]) => ({
    month,
    revenue: d.revenue,
    cost: d.cost,
    expense: d.expense,
    profit: d.revenue - d.cost - d.expense,
  }));
}
