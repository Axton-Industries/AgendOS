"use client";

import { useCallback, useEffect, useState } from "react";

type Note = { id: string; title: string; content: string; updated_at: string };

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<{ id: string | null; title: string; content: string } | null>(null);

  const load = useCallback(async (q = "") => {
    const res = await fetch(`/api/notes${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    setNotes((await res.json()).notes);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const url = editing.id ? `/api/notes/${editing.id}` : "/api/notes";
    await fetch(url, {
      method: editing.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editing.title, content: editing.content }),
    });
    setEditing(null);
    load(query);
  }

  async function remove(id: string) {
    if (!confirm("Delete this note?")) return;
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    load(query);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">Notes</h1>
        <form className="ml-auto flex gap-2" onSubmit={(e) => { e.preventDefault(); load(query); }}>
          <input className="input w-48" placeholder="Search notes…" value={query}
            onChange={(e) => setQuery(e.target.value)} />
          <button className="btn-secondary">Search</button>
        </form>
        <button className="btn" onClick={() => setEditing({ id: null, title: "", content: "" })}>+ Note</button>
      </div>

      {notes.length === 0 && <p className="card text-sm text-zinc-500">No notes{query ? " matching your search" : " yet"}.</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {notes.map((n) => (
          <div key={n.id} className="card group relative">
            <h2 className="pr-6 font-semibold">{n.title}</h2>
            <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-400">{n.content}</p>
            <div className="mt-3 flex items-center gap-3 text-xs text-zinc-600">
              <span>{n.updated_at.slice(0, 10)}</span>
              <button className="hover:text-zinc-300" onClick={() => setEditing({ id: n.id, title: n.title, content: n.content })}>Edit</button>
              <button className="hover:text-red-400" onClick={() => remove(n.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setEditing(null)}>
          <form className="card w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <h2 className="text-lg font-semibold">{editing.id ? "Edit note" : "New note"}</h2>
            <input className="input" placeholder="Title" required value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <textarea className="input" rows={8} placeholder="Write something…" value={editing.content}
              onChange={(e) => setEditing({ ...editing, content: e.target.value })} />
            <button className="btn">Save</button>
          </form>
        </div>
      )}
    </div>
  );
}
