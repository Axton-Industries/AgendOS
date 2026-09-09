import { db, newId, nowIso } from "@/lib/db";
import { todayStr, monthStart, addMonths } from "@/lib/dates";

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount_cents: number;
  description: string;
  category: string;
  date: string; // "YYYY-MM-DD"
}

export function createTransaction(
  userId: string,
  input: { type: "income" | "expense"; amountCents: number; description?: string; category?: string; date: string }
): Transaction {
  if (!["income", "expense"].includes(input.type)) throw new Error("Type must be income or expense");
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) throw new Error("Amount must be a positive number");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error("Date must be YYYY-MM-DD");
  const id = newId();
  db.prepare(
    `INSERT INTO transactions (id, user_id, type, amount_cents, description, category, date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, userId, input.type, input.amountCents, input.description ?? "", input.category ?? "", input.date, nowIso());
  return getTransaction(userId, id)!;
}

export function getTransaction(userId: string, id: string): Transaction | null {
  return (db.prepare("SELECT * FROM transactions WHERE user_id = ? AND id = ?").get(userId, id) as any) ?? null;
}

export function deleteTransaction(userId: string, id: string): boolean {
  return db.prepare("DELETE FROM transactions WHERE user_id = ? AND id = ?").run(userId, id).changes > 0;
}

export function listTransactions(userId: string, opts: { from?: string; to?: string; limit?: number } = {}): Transaction[] {
  let sql = "SELECT * FROM transactions WHERE user_id = ?";
  const params: any[] = [userId];
  if (opts.from) { sql += " AND date >= ?"; params.push(opts.from); }
  if (opts.to) { sql += " AND date < ?"; params.push(opts.to); }
  sql += " ORDER BY date DESC, created_at DESC";
  if (opts.limit) { sql += " LIMIT ?"; params.push(opts.limit); }
  return db.prepare(sql).all(...params) as unknown as Transaction[];
}

export interface FinanceSummary {
  balanceCents: number;
  totalIncomeCents: number;
  totalExpensesCents: number;
  monthIncomeCents: number;
  monthExpensesCents: number;
  byCategory: { category: string; cents: number }[];
}

export function getSummary(userId: string): FinanceSummary {
  const monthFrom = monthStart(todayStr());
  const monthTo = addMonths(monthFrom, 1);

  const totals = db.prepare(
    `SELECT
       COALESCE(SUM(CASE WHEN type='income' THEN amount_cents ELSE 0 END), 0) AS income,
       COALESCE(SUM(CASE WHEN type='expense' THEN amount_cents ELSE 0 END), 0) AS expenses
     FROM transactions WHERE user_id = ?`
  ).get(userId) as any;

  const month = db.prepare(
    `SELECT
       COALESCE(SUM(CASE WHEN type='income' THEN amount_cents ELSE 0 END), 0) AS income,
       COALESCE(SUM(CASE WHEN type='expense' THEN amount_cents ELSE 0 END), 0) AS expenses
     FROM transactions WHERE user_id = ? AND date >= ? AND date < ?`
  ).get(userId, monthFrom, monthTo) as any;

  const byCategory = (db.prepare(
    `SELECT COALESCE(NULLIF(category, ''), 'Uncategorized') AS category, SUM(amount_cents) AS cents
     FROM transactions WHERE user_id = ? AND type = 'expense' AND date >= ? AND date < ?
     GROUP BY category ORDER BY cents DESC`
  ).all(userId, monthFrom, monthTo) as any[]).map((r) => ({ category: r.category, cents: r.cents }));

  return {
    balanceCents: totals.income - totals.expenses,
    totalIncomeCents: totals.income,
    totalExpensesCents: totals.expenses,
    monthIncomeCents: month.income,
    monthExpensesCents: month.expenses,
    byCategory,
  };
}
