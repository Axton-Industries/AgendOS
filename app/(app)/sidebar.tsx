"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MODULES, type ModuleIcon } from "@/modules/registry";

function Mark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" className="h-7 w-7 shrink-0 text-neon">
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
    </svg>
  );
}

function NavIcon({ icon, className }: { icon: ModuleIcon; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      {icon.paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    try {
      const t = localStorage.getItem("agendos-theme");
      if (t === "light" || t === "dark") {
        setTheme(t);
        document.documentElement.dataset.theme = t;
      }
    } catch {}
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("agendos-theme", next); } catch {}
  }

  return (
    <button onClick={toggle}
      className="flex h-8 w-8 items-center justify-center rounded border border-line-strong bg-panel text-ink-muted hover:bg-neon/10 hover:text-neon"
      aria-label="Toggle dark/light mode" title={theme === "dark" ? "Switch to light" : "Switch to dark"}>
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
          strokeLinecap="round" className="h-4 w-4">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5v2.5M12 19v2.5M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2.5 12H5M19 12h2.5M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const nav = (
    <div className="flex h-full flex-col">
      <div className={`flex items-center gap-3 px-4 py-5 ${collapsed ? "justify-center px-0" : ""}`}>
        <Mark />
        {!collapsed && <span className="text-sm font-bold tracking-widest text-ink">AGENDOS</span>}
      </div>
      <nav className={`flex-1 space-y-1 ${collapsed ? "flex flex-col items-center px-2" : "px-3"}`}>
        {!collapsed && (
          <div className="px-3 pb-1 text-[10px] font-medium uppercase tracking-widest text-ink-muted">Modules</div>
        )}
        {MODULES.map((m) => {
          const active = pathname === m.href;
          return (
            <Link key={m.href} href={m.href} onClick={() => setOpen(false)}
              title={collapsed ? m.label : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                collapsed ? "w-10 justify-center px-0" : ""
              } ${active ? "bg-neon/10 font-medium text-neon-deep" : "text-ink-muted hover:bg-neon/10 hover:text-ink"}`}>
              <NavIcon icon={m.icon} className={`h-[18px] w-[18px] shrink-0 ${active ? "text-neon" : "text-ink-faint"}`} />
              {!collapsed && <span className="truncate">{m.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className={`flex items-center gap-3 px-4 py-4 ${collapsed ? "flex-col" : "justify-between"}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "flex-col" : ""}`}>
          <Link href="/settings" title="Settings"
            className={`flex h-8 w-8 items-center justify-center rounded border border-line-strong bg-panel text-ink-muted hover:bg-neon/10 hover:text-neon ${
              pathname === "/settings" ? "text-neon" : ""
            }`}
            aria-label="Open settings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>
          <ThemeToggle />
        </div>
        {!collapsed && <span className="text-[10px] text-ink-faint">v0.1</span>}
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-30 flex items-center gap-3 border-b border-line bg-top px-4 py-3 lg:hidden">
        <button className="text-xl text-ink" onClick={() => setOpen(true)} aria-label="Open menu">☰</button>
        <span className="font-bold tracking-widest text-ink">AGENDOS</span>
        <div className="ml-auto"><ThemeToggle /></div>
      </div>

      {open && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-line bg-top transition-all lg:relative lg:translate-x-0 ${
        collapsed ? "lg:w-16" : ""
      } ${open ? "translate-x-0" : "-translate-x-full"}`}>
        {nav}
        <button onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-4 top-1/2 z-50 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-line-strong bg-top text-ink-muted shadow-sm hover:text-neon lg:flex"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          <NavIcon icon={{ paths: collapsed ? ["M9 18l6-6-6-6"] : ["M15 18l-6-6 6-6"] }} className="h-4 w-4" />
        </button>
      </aside>
    </>
  );
}