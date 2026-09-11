"use client";

import { useEffect, useRef, useState } from "react";
import { LangToggle } from "@/i18n";

type Msg = { role: "user" | "assistant"; content: string };

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export default function AssistantDock() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  const rec = useRef<any>(null);

  useEffect(() => {
    if (!open) {
      setListening(false);
      rec.current?.stop?.();
      return;
    }
    fetch("/api/ai/messages")
      .then((r) => r.json())
      .then((d) => setMessages(d.messages.map((m: any) => ({ role: m.role, content: m.content }))))
      .catch(() => {});
  }, [open]);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  const recSupported =
    typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  function send(raw?: string) {
    const text = (raw ?? input).trim();
    if (!text || busy) return;
    setInput("");
    setError("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setBusy(true);
    fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    })
      .then(async (res) => {
        const d = await res.json();
        if (!res.ok) throw new Error(d.error);
        setMessages((m) => [...m, { role: "assistant", content: d.reply }]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setBusy(false));
  }

  function toggleMic() {
    if (listening) {
      rec.current?.stop?.();
      setListening(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.lang = navigator.language || "en";
    r.interimResults = false;
    r.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setListening(false);
      setInput(t);
      send(t);
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    rec.current = r;
    try { r.start(); setListening(true); } catch { setListening(false); }
  }

  return (
    <>
      <button onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-neon bg-neon text-white transition-transform hover:scale-105"
        style={{ boxShadow: "0 0 24px rgba(0,194,255,0.45)" }}
        title={t("closeAssistant")}
        aria-label={t("closeAssistant")}>
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-6 w-6">
            <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
            <ellipse cx="12" cy="12" rx="10" ry="4" />
            <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
            <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
          </svg>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[min(70vh,32rem)] w-[min(92vw,24rem)] flex-col overflow-hidden rounded-xl border border-line-strong bg-top/95 shadow-2xl"
          style={{ boxShadow: "0 0 40px rgba(0,194,255,0.12)" }}>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-bold tracking-widest text-ink">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-4 w-4 text-neon">
                <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
                <ellipse cx="12" cy="12" rx="10" ry="4" />
                <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
                <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
              </svg>
              {t("assistantTitle")}
            </span>
            {listening && <span className="animate-pulse text-[11px] text-neon">● listening</span>}
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
            {messages.length === 0 && !busy && (
              <div className="text-xs text-ink-muted">
                {t("assistantHint")}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[90%] rounded-xl px-3 py-2 text-[13px] whitespace-pre-wrap ${
                m.role === "user" ? "ml-auto bg-neon text-white" : "border border-line bg-panel text-ink-soft"
              }`}>
                {m.content}
              </div>
            ))}
            {busy && <div className="w-24 rounded-xl border border-line bg-panel px-3 py-2 text-[13px] text-ink-faint">thinking…</div>}
            {error && <div className="text-xs text-red-400">{error}</div>}
            <div ref={bottom} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 border-t border-line p-3">
            {recSupported && (
              <button type="button" onClick={toggleMic} title={t("speakInstead")}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded border ${
                  listening ? "border-neon bg-neon text-white" : "border-line-strong bg-panel text-ink-muted hover:text-neon"
                }`}
                aria-label="Speak instead of typing">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <rect x="9" y="2.5" width="6" height="11" rx="2.5" />
                  <path d="M5 11a7 7 0 0 0 14 0M12 18v3.5" />
                </svg>
              </button>
            )}
            <input className="input flex-1" placeholder={t("askAnything")} value={input}
              onChange={(e) => setInput(e.target.value)} disabled={busy} />
            <button className="btn h-9 px-3" disabled={busy || !input.trim()}>Send</button>
          </form>
        </div>
      )}
    </>
  );
}