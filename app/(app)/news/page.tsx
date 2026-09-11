"use client";

import { useCallback, useEffect, useState } from "react";

type Article = { source: string; category: string; title: string; link: string; published: string | null };

const CATEGORIES = [
  { key: "", label: "All" },
  { key: "world", label: "World" },
  { key: "tech", label: "Tech" },
  { key: "sport", label: "Sport" },
];

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (cat: string) => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/news${cat ? `?category=${cat}` : ""}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setArticles(d.articles);
    } catch (e: any) {
      setError(e.message);
    }
    setBusy(false);
  }, []);

  useEffect(() => { load(category); }, [category, load]);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="page-title">News</h1>
        <div className="ml-auto flex gap-1">
          {CATEGORIES.map((c) => (
            <button key={c.key} onClick={() => setCategory(c.key)}
              className={`rounded-lg px-3 py-1.5 text-sm ${category === c.key ? "bg-neon font-bold text-white" : "text-zinc-400 hover:bg-neon/10"}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="card text-sm text-red-400">{error}</p>}
      {busy && <p className="card text-sm text-zinc-500">Loading feeds…</p>}

      {!busy && articles.length === 0 && !error && (
        <p className="card text-sm text-zinc-500">No headlines available right now.</p>
      )}

      <ul className="space-y-2">
        {articles.map((a, i) => (
          <li key={i} className="card !p-4">
            <a href={a.link} target="_blank" rel="noreferrer" className="text-sm font-medium hover:text-neon">
              {a.title}
            </a>
            <p className="mt-1 text-xs text-zinc-500">
              {a.source}
              {a.published && ` · ${new Date(a.published).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`}
            </p>
          </li>
        ))}
      </ul>

      <p className="text-xs text-zinc-600">Headlines from BBC and The Guardian RSS feeds. Ask the AI to summarize them.</p>
    </div>
  );
}
