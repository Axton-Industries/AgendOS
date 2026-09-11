"use client";

import { useCallback, useEffect, useState } from "react";
import { fmtCents } from "@/lib/format";
import { todayStr } from "@/lib/dates";

type Tx = { id: string; type: "income" | "expense"; amount_cents: number; description: string; category: string; date: string };
type Summary = {
  balanceCents: number; totalIncomeCents: number; totalExpensesCents: number;
  monthIncomeCents: number; monthExpensesCents: number; byCategory: { category: string; cents: number }[];
};

export default function BalancePage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(todayStr());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [s, t] = await Promise.all([
      fetch("/api/finance/summary").then((r) => r.json()),
      fetch("/api/finance/transactions?limit=30").then((r) => r.json()),
    ]);
    setSummary(s.summary);
    setTransactions(t.transactions);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/finance/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, amount, description, category, date }),
    });
    setBusy(false);
    if (!res.ok) { setError((await res.json()).error); return; }
    setAmount(""); setDescription(""); setCategory("");
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/finance/transactions/${id}`, { method: "DELETE" });
    load();
  }

  const maxCat = summary?.byCategory[0]?.cents ?? 1;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="page-title">Balance</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="section-title">Current balance</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">{summary ? fmtCents(summary.balanceCents) : "…"}</p>
        </div>
        <div className="card">
          <p className="section-title">Income this month</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-emerald-400">{summary ? fmtCents(summary.monthIncomeCents) : "…"}</p>
        </div>
        <div className="card">
          <p className="section-title">Spent this month</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-red-400">{summary ? fmtCents(summary.monthExpensesCents) : "…"}</p>
        </div>
      </div>

      {summary && summary.byCategory.length > 0 && (
        <section className="card">
          <h2 className="mb-3 section-title">Spending by category (this month)</h2>
          <div className="space-y-2">
            {summary.byCategory.map(({ category, cents }) => (
              <div key={category} className="flex items-center gap-3 text-sm">
                <span className="w-32 shrink-0 truncate text-zinc-400">{category}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-neon/10">
                  <div className="h-full rounded-full bg-neon" style={{ width: `${Math.max((cents / maxCat) * 100, 2)}%` }} />
                </div>
                <span className="w-20 shrink-0 text-right">{fmtCents(cents)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card">
          <h2 className="mb-3 section-title">Add transaction</h2>
          <form onSubmit={add} className="space-y-3">
            <div className="flex gap-2">
              {(["expense", "income"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`flex-1 rounded-lg border px-3 py-1.5 text-sm capitalize ${
                    type === t
                      ? t === "expense" ? "border-red-500 bg-red-950/40 text-red-300" : "border-emerald-500 bg-emerald-950/40 text-emerald-300"
                      : "border-zinc-700 text-zinc-400"
                  }`}>
                  {t}
                </button>
              ))}
            </div>
            <input className="input" type="number" step="0.01" min="0.01" required placeholder="Amount (€)" value={amount}
              onChange={(e) => setAmount(e.target.value)} />
            <input className="input" placeholder={`Description (e.g. ${type === "expense" ? "Groceries" : "Salary"})`} value={description}
              onChange={(e) => setDescription(e.target.value)} />
            <input className="input" placeholder={`Category (e.g. ${type === "expense" ? "Food" : "Work"})`} value={category}
              onChange={(e) => setCategory(e.target.value)} />
            <input className="input" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button className="btn" disabled={busy}>Add {type}</button>
          </form>
        </section>

        <section className="card">
          <h2 className="mb-3 section-title">Recent transactions</h2>
          <ul className="divide-y divide-zinc-800">
            {transactions.map((t) => (
              <li key={t.id} className="group flex items-center gap-3 py-2 text-sm">
                <span className={`flex-1 ${t.type === "income" ? "text-emerald-400" : ""}`}>
                  {t.description || t.category || (t.type === "income" ? "Income" : "Expense")}
                  {t.category && <span className="ml-2 text-xs text-zinc-500">{t.category}</span>}
                </span>
                <span className="text-xs text-zinc-500">{t.date.slice(5)}</span>
                <span className={`w-20 text-right font-medium ${t.type === "income" ? "text-emerald-400" : "text-zinc-200"}`}>
                  {t.type === "income" ? "+" : "−"}{fmtCents(t.amount_cents)}
                </span>
                <button onClick={() => remove(t.id)} aria-label="Delete"
                  className="text-zinc-600 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100">×</button>
              </li>
            ))}
            {transactions.length === 0 && <li className="py-2 text-sm text-zinc-500">No transactions yet.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
