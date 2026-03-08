import { z } from 'zod';

export const transactionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日付の形式が不正です'),
  debitAccountId: z.string().min(1, '借方科目を選択してください'),
  creditAccountId: z.string().min(1, '貸方科目を選択してください'),
  amount: z.number().int().positive('金額は1以上の整数を入力してください'),
  taxIncluded: z.boolean(),
  description: z.string().max(200, '摘要は200文字以内で入力してください'),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
