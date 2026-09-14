"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "@/lib/i18n";

type Msg = { role: "user" | "assistant"; content: string };

export default function AssistantPage() {
  const { t, lang } = useTranslations();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/ai/messages")
      .then((r) => r.json())
      .then((d) => setMessages(d.messages.map((m: any) => ({ role: m.role, content: m.content }))))
      .catch(() => {});
  }, []);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setError("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setBusy(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, lang }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setMessages((m) => [...m, { role: "assistant", content: d.reply }]);
    } catch (e: any) {
      setError(e.message);
    }
    setBusy(false);
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col lg:h-[calc(100vh-4rem)]">
      <h1 className="page-title py-4">{t("assistantPageTitle")}</h1>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 && !busy && (
          <div className="card text-sm text-zinc-400">
            {t("assistantPageHint")}
            <ul className="mt-2 space-y-1 text-zinc-500">
              <li>{t("assistantHint1")}</li>
              <li>{t("assistantHint2")}</li>
              <li>{t("assistantHint3")}</li>
              <li>{t("assistantHint4")}</li>
            </ul>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
            m.role === "user"
              ? "ml-auto bg-neon text-white"
              : "bg-zinc-900 text-ink-soft"
          }`}>
            {m.content}
          </div>
        ))}
        {busy && <div className="w-24 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm text-ink-faint">{t("thinking")}</div>}
        {error && <div className="card text-sm text-red-400">{error}</div>}
        <div ref={bottom} />
      </div>

      <form onSubmit={send} className="flex gap-2 py-4">
        <input className="input" placeholder={t("askAssistantPlaceholder")} value={input}
          onChange={(e) => setInput(e.target.value)} disabled={busy} />
        <button className="btn" disabled={busy || !input.trim()}>{t("send")}</button>
      </form>
    </div>
  );
}
