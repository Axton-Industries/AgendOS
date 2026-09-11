"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MODULES } from "@/modules/registry";

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-6">
        <span className="text-lg font-bold tracking-widest">LIFE OS</span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {MODULES.map((m) => {
          const active = pathname === m.href;
          return (
            <Link key={m.href} href={m.href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active ? "bg-emerald-600/15 font-medium text-emerald-400" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              }`}>
              <span className="w-5 text-center">{m.icon}</span> {m.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center gap-3 border-b border-zinc-800 bg-zinc-950/90 px-4 py-3 backdrop-blur lg:hidden">
        <button className="text-xl" onClick={() => setOpen(true)} aria-label="Open menu">☰</button>
        <span className="font-bold tracking-widest">LIFE OS</span>
      </div>

      {/* Sidebar: drawer on mobile, static on desktop */}
      {open && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-zinc-800 bg-zinc-900 transition-transform lg:static lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}>
        {nav}
      </aside>
    </>
  );
}
