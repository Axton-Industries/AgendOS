"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/lib/i18n";

const PRESETS = [
  { name: "Ollama (local)", baseUrl: "http://localhost:11434/v1", model: "llama3.2", defaultKey: "ollama", keyUrl: null, note: "local" as const },
  { name: "LM Studio (local)", baseUrl: "http://localhost:1234/v1", model: "lmstudio", defaultKey: "lm-studio", keyUrl: null, note: "local" as const },
  { name: "Google Gemini", baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai", model: "gemini-2.0-flash", defaultKey: "", keyUrl: "https://aistudio.google.com/apikey", note: "key" as const },
  { name: "Groq", baseUrl: "https://api.groq.com/openai/v1", model: "openai/gpt-oss-120b", defaultKey: "", keyUrl: "https://console.groq.com/keys", note: "key" as const },
  { name: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1", model: "openrouter/free", defaultKey: "", keyUrl: "https://openrouter.ai/keys", note: "key" as const },
  { name: "NVIDIA NIM", baseUrl: "https://integrate.api.nvidia.com/v1", model: "meta/llama-3.1-8b-instruct", defaultKey: "", keyUrl: "https://build.nvidia.com", note: "key" as const },
] as const;

export default function SettingsPage() {
  const { t } = useTranslations();
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [active, setActive] = useState<null | (typeof PRESETS)[number]>(null);
  const [testing, setTesting] = useState(false);
  const [test, setTest] = useState<null | { ok: boolean; text: string }>(null);
  const [models, setModels] = useState<{ id: string; category: "free" | "paid" | "other" }[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelError, setModelError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setBaseUrl(d.ai.baseUrl);
        setModel(d.ai.model);
        setHasApiKey(d.ai.hasApiKey);
        if (d.ai.hasApiKey) {
          fetch("/api/settings/models", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ baseUrl: d.ai.baseUrl }),
          }).then((r) => r.json()).then((d) => { if (d.models) setModels(d.models); });
        }
      })
      .catch(() => setError(t("couldNotLoad")));
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
      const res = await fetch("/api/settings/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseUrl, apiKey }),
      });
      const d = await res.json();
      if (!res.ok) setModelError(d.error ?? t("couldNotLoadModels"));
      else setModels(d.models);
    } catch (e: any) {
      setModelError(e.message);
    }
    setLoadingModels(false);
  }

  const choices = [
    { label: t("modelsFree"), cat: "free" as const },
    { label: t("modelsPaid"), cat: "paid" as const },
    { label: t("modelsAll"), cat: "other" as const },
  ]
    .map((g) => ({ ...g, items: models.filter((m) => m.category === g.cat) }))
    .filter((g) => g.items.length);

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
    if (!res.ok) return setError(d.error ?? t("saveFailed"));
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
      const res = await fetch("/api/settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ai: { baseUrl, model, apiKey } }),
      });
      const d = await res.json();
      setTest(d.ok ? { ok: true, text: d.reply } : { ok: false, text: d.error });
    } catch (e: any) {
      setTest({ ok: false, text: e.message });
    }
    setTesting(false);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="page-title pb-1">{t("settingsPageTitle")}</h1>
      <p className="pb-6 text-sm text-ink-muted">{t("settingsDescription")}</p>

      <div className="card">
        <h2 className="section-title pb-3">{t("apis")}</h2>

        <div className="pb-4">
          <span className="label">{t("quickSetup")}</span>
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
              {t(active.note === "local" ? "presetLocalNote" : "presetKeyNote")}{" "}
              {active.keyUrl && (
                <a className="text-neon hover:underline" href={active.keyUrl} target="_blank" rel="noreferrer">
                  {t("getKey")}
                </a>
              )}
            </p>
          )}
        </div>

        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label" htmlFor="baseUrl">{t("baseUrl")}</label>
            <input id="baseUrl" className="input" value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://api.openai.com/v1" />
          </div>

          <div>
            <label className="label" htmlFor="model">{t("model")}</label>
            <div className="flex gap-2">
              <select id="model" className="input flex-1" value={model}
                disabled={choices.length === 0 && !model}
                onChange={(e) => setModel(e.target.value)}>
                {!model && <option value="" disabled>{t("noModelsLoaded")}</option>}
                {model && !models.some((m) => m.id === model) && <option value={model}>{model}</option>}
                {choices.map((g) => (
                  <optgroup key={g.label} label={g.label}>
                    {g.items.map((m) => <option key={m.id} value={m.id}>{m.id}</option>)}
                  </optgroup>
                ))}
              </select>
              <button type="button" className="btn-secondary shrink-0" onClick={loadModels} disabled={loadingModels || !apiKey.trim() && !hasApiKey}>
                {loadingModels ? t("loading") : models.length ? t("reloadModels") : t("loadModels")}
              </button>
            </div>
            {modelError && <p className="pt-1 text-xs text-red-400">{modelError}</p>}
            {!modelError && models.length > 0 && (
              <p className="pt-1 text-xs text-ink-faint">{t("modelsAvailable", { n: models.length })}</p>
            )}
          </div>

          <div>
            <label className="label" htmlFor="apiKey">{t("apiKey")}</label>
            <input id="apiKey" className="input" type="password" value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={hasApiKey ? t("apiKeyPlaceholder") : t("apiKeyPlaceholderNew")} />
          </div>

          {error && <div className="text-sm text-red-400">{error}</div>}
          {saved && <div className="text-sm text-emerald-400">{t("savedMsg")}</div>}
          {test && (
            <div className={`text-sm ${test.ok ? "text-emerald-400" : "text-red-400"}`}>
              {test.ok ? t("connected") + ` "${test.text}"` : test.text}
            </div>
          )}

          <div className="flex gap-2">
            <button className="btn" disabled={!baseUrl.trim() || !model.trim()}>{t("saveConfig")}</button>
            <button type="button" className="btn-secondary" onClick={testConnection} disabled={testing || !apiKey.trim() && !hasApiKey}>
              {testing ? t("testing") : t("testConnection")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}