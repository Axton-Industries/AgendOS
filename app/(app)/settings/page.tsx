"use client";

import { useEffect, useState } from "react";

const PRESETS = [
  { name: "Ollama (local)", baseUrl: "http://localhost:11434/v1", model: "llama3.2", defaultKey: "ollama", keyUrl: null, note: "Runs on your machine — works instantly, no key needed." },
  { name: "LM Studio (local)", baseUrl: "http://localhost:1234/v1", model: "lmstudio", defaultKey: "lm-studio", keyUrl: null, note: "Runs on your machine — works instantly, no key needed." },
  { name: "Google Gemini", baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai", model: "gemini-2.0-flash", defaultKey: "", keyUrl: "https://aistudio.google.com/apikey", note: "Needs your free key — get one from the link, paste it in the key field." },
  { name: "Groq", baseUrl: "https://api.groq.com/openai/v1", model: "llama-3.3-70b-versatile", defaultKey: "", keyUrl: "https://console.groq.com/keys", note: "Needs your free key — get one from the link, paste it in the key field." },
  { name: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1", model: "openrouter/free", defaultKey: "", keyUrl: "https://openrouter.ai/keys", note: "Needs your free key — get one from the link, paste it in the key field." },
  { name: "NVIDIA NIM", baseUrl: "https://integrate.api.nvidia.com/v1", model: "meta/llama-3.1-8b-instruct", defaultKey: "", keyUrl: "https://build.nvidia.com", note: "Needs your free key — get one from the link, paste it in the key field." },
] as const;

export default function SettingsPage() {
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [active, setActive] = useState<null | (typeof PRESETS)[number]>(null);
  const [testing, setTesting] = useState(false);
  const [test, setTest] = useState<null | { ok: boolean; text: string }>(null);
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelError, setModelError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setBaseUrl(d.ai.baseUrl);
        setModel(d.ai.model);
        setHasApiKey(d.ai.hasApiKey);
        if (d.ai.hasApiKey) loadModels();
      })
      .catch(() => setError("Could not load settings"));
  }, []);

  function pick(p: (typeof PRESETS)[number]) {
    setActive(p);
    setBaseUrl(p.baseUrl);
    setModel(p.model);
    setApiKey(p.defaultKey);
    setSaved(false);
    setTest(null);
  }

  async function loadModels() {
    setLoadingModels(true);
    setModelError("");
    try {
      const res = await fetch("/api/settings/models");
      const d = await res.json();
      if (!res.ok) setModelError(d.error ?? "Could not load models");
      else setModels(d.models);
    } catch (e: any) {
      setModelError(e.message);
    }
    setLoadingModels(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    setError("");
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ai: { baseUrl, model, apiKey } }),
    });
    const d = await res.json();
    if (!res.ok) return setError(d.error ?? "Save failed");
    setHasApiKey(apiKey.trim() !== "" || hasApiKey);
    setApiKey("");
    setSaved(true);
    loadModels();
  }

  async function testConnection() {
    setTesting(true);
    setTest(null);
    setError("");
    try {
      const res = await fetch("/api/settings/test", { method: "POST" });
      const d = await res.json();
      setTest(d.ok ? { ok: true, text: d.reply } : { ok: false, text: d.error });
    } catch (e: any) {
      setTest({ ok: false, text: e.message });
    }
    setTesting(false);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="page-title pb-1">Settings</h1>
      <p className="pb-6 text-sm text-ink-muted">Configure how AgendOS connects to external services.</p>

      <div className="card">
        <h2 className="section-title pb-3">API’s</h2>

        <div className="pb-4">
          <span className="label">Quick setup</span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p.name} type="button"
                onClick={() => pick(p)}
                className={`rounded border px-3 py-1.5 text-xs transition-colors ${
                  active?.name === p.name
                    ? "border-neon bg-neon/10 text-neon"
                    : "border-line-strong bg-panel text-ink-soft hover:bg-neon/10 hover:text-neon"
                }`}>
                {p.name}
              </button>
            ))}
          </div>
          {active && (
            <p className="pt-2 text-xs text-ink-faint">
              {active.note}{" "}
              {active.keyUrl && (
                <a className="text-neon hover:underline" href={active.keyUrl} target="_blank" rel="noreferrer">
                  Get a free key →
                </a>
              )}
            </p>
          )}
        </div>

        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label" htmlFor="baseUrl">Base URL</label>
            <input id="baseUrl" className="input" value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://api.openai.com/v1" />
          </div>

          <div>
            <label className="label" htmlFor="model">Model</label>
            <div className="flex gap-2">
              <input id="model" className="input flex-1" list="model-options" value={model}
                onChange={(e) => setModel(e.target.value)} placeholder="gpt-4o-mini" />
              <button type="button" className="btn-secondary shrink-0" onClick={loadModels} disabled={loadingModels || !hasApiKey}>
                {loadingModels ? "Loading…" : models.length ? "Reload" : "Load models"}
              </button>
            </div>
            <datalist id="model-options">
              {models.map((m) => <option key={m} value={m} />)}
            </datalist>
            {modelError && <p className="pt-1 text-xs text-red-400">{modelError}</p>}
            {!modelError && models.length > 0 && (
              <p className="pt-1 text-xs text-ink-faint">{models.length} models available — pick one from the dropdown.</p>
            )}
          </div>

          <div>
            <label className="label" htmlFor="apiKey">API Key</label>
            <input id="apiKey" className="input" type="password" value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={hasApiKey ? "•••••••• (already set, leave blank to keep)" : "sk-…"} />
          </div>

          {error && <div className="text-sm text-red-400">{error}</div>}
          {saved && <div className="text-sm text-emerald-400">Saved.</div>}
          {test && (
            <div className={`text-sm ${test.ok ? "text-emerald-400" : "text-red-400"}`}>
              Test: {test.ok ? `connected — model replied "${test.text}"` : test.text}
            </div>
          )}

          <div className="flex gap-2">
            <button className="btn" disabled={!baseUrl.trim() || !model.trim()}>Save configuration</button>
            <button type="button" className="btn-secondary" onClick={testConnection} disabled={testing || !hasApiKey}>
              {testing ? "Testing…" : "Test connection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}