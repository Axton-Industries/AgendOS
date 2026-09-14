"use client";

import { useCallback, useEffect, useState } from "react";
import { fmtCents } from "@/lib/format";
import { todayStr } from "@/lib/dates";
import { useTranslations } from "@/lib/i18n";

type Tx = { id: string; type: "income" | "expense"; amount_cents: number; description: string; category: string; date: string };
type Summary = {
  balanceCents: number; totalIncomeCents: number; totalExpensesCents: number;
  monthIncomeCents: number; monthExpensesCents: number; byCategory: { category: string; cents: number }[];
};

export default function BalancePage() {
  const { t } = useTranslations();
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
      <h1 className="page-title">{t("balancePageTitle")}</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="section-title">{t("currentBalance")}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">{summary ? fmtCents(summary.balanceCents) : "…"}</p>
        </div>
        <div className="card">
          <p className="section-title">{t("incomeThisMonth")}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-emerald-400">{summary ? fmtCents(summary.monthIncomeCents) : "…"}</p>
        </div>
        <div className="card">
          <p className="section-title">{t("spentThisMonth")}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-red-400">{summary ? fmtCents(summary.monthExpensesCents) : "…"}</p>
        </div>
      </div>

      {summary && summary.byCategory.length > 0 && (
        <section className="card">
          <h2 className="mb-3 section-title">{t("spendingByCategory")}</h2>
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
          <h2 className="mb-3 section-title">{t("addTransaction")}</h2>
          <form onSubmit={add} className="space-y-3">
            <div className="flex gap-2">
              {(["expense", "income"] as const).map((ty) => (
                <button key={ty} type="button" onClick={() => setType(ty)}
                  className={`flex-1 rounded-lg border px-3 py-1.5 text-sm capitalize ${
                    type === ty
                      ? ty === "expense" ? "border-red-500 bg-red-950/40 text-red-300" : "border-emerald-500 bg-emerald-950/40 text-emerald-300"
                      : "border-zinc-700 text-zinc-400"
                  }`}>
                  {t(ty)}
                </button>
              ))}
            </div>
            <input className="input" type="number" step="0.01" min="0.01" required placeholder={t("amount")} value={amount}
              onChange={(e) => setAmount(e.target.value)} />
            <input className="input" placeholder={`${t("descriptionExample")} ${t(type === "expense" ? "groceries" : "salary")})`} value={description}
              onChange={(e) => setDescription(e.target.value)} />
            <input className="input" placeholder={`${t("categoryExample")} ${t(type === "expense" ? "food" : "work")})`} value={category}
              onChange={(e) => setCategory(e.target.value)} />
            <input className="input" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button className="btn" disabled={busy}>{t("add")} {t(type)}</button>
          </form>
        </section>

        <section className="card">
          <h2 className="mb-3 section-title">{t("recentTransactions")}</h2>
          <ul className="divide-y divide-zinc-800">
            {transactions.map((tr) => (
              <li key={tr.id} className="group flex items-center gap-3 py-2 text-sm">
                <span className={`flex-1 ${tr.type === "income" ? "text-emerald-400" : ""}`}>
                  {tr.description || tr.category || (tr.type === "income" ? t("incomeFallback") : t("expenseFallback"))}
                  {tr.category && <span className="ml-2 text-xs text-zinc-500">{tr.category}</span>}
                </span>
                <span className="text-xs text-zinc-500">{tr.date.slice(5)}</span>
                <span className={`w-20 text-right font-medium ${tr.type === "income" ? "text-emerald-400" : "text-zinc-200"}`}>
                  {tr.type === "income" ? "+" : "−"}{fmtCents(tr.amount_cents)}
                </span>
                <button onClick={() => remove(tr.id)} aria-label={t("delete")}
                  className="text-zinc-600 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100">×</button>
              </li>
            ))}
            {transactions.length === 0 && <li className="py-2 text-sm text-zinc-500">{t("noTransactions")}</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
