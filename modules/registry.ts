// Module registry. Future modules get `soon: true` and render disabled with a
// "Coming Soon" tag — add their entry to MODULES when implemented.
export type ModuleIcon = { paths: string[] };

const icon = (...paths: string[]): ModuleIcon => ({ paths });

export const MODULES = [
  { href: "/", label: "Daily Brief", icon: icon(
    "M3 3h7v7H3z", "M14 3h7v7h-7z", "M3 14h7v7H3z", "M14 14h7v7h-7z",
  ) },
  { href: "/assistant", label: "AI Assistant", icon: icon(
    "M12 3l1.9 5.2 5.1 1.9-5.1 1.9L12 17l-1.9-5.1L5 10.1l5.1-1.9z",
    "M19 15l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7z",
    "M5.5 16l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z",
  ) },
  { href: "/calendar", label: "Calendar", icon: icon(
    "M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z",
    "M3 9h18", "M8 3v4", "M16 3v4",
  ) },
  { href: "/weather", label: "Weather", icon: icon(
    "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z",
    "M12 2v2", "M12 20v2", "M4.9 4.9l1.4 1.4", "M17.7 17.7l1.4 1.4",
    "M2 12h2", "M20 12h2", "M4.9 19.1l1.4-1.4", "M17.7 6.3l1.4-1.4",
  ) },
  { href: "/balance", label: "Balance", icon: icon(
    "M21 12V7H5a2 2 0 0 1 0-4h14v4",
    "M3 9a3 3 0 0 1 3-3h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2 3 3 0 0 1 0-6z",
    "M20 14h-4a2 2 0 0 0 0 4h4a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1z",
  ) },
  { href: "/notes", label: "Notes", icon: icon(
    "M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z",
    "M13 3v5h5", "M9 13h6", "M9 17h6",
  ) },
  { href: "/health", label: "Health", icon: icon(
    "M12 20.5C6 16 3.5 12.5 3.5 8.5a4.5 4.5 0 0 1 8.5-2.5 4.5 4.5 0 0 1 8.5 2.5c0 4-2.5 7.5-8.5 12z",
  ) },
  { href: "/maps", label: "Maps", icon: icon(
    "M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z",
    "M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  ) },
  { href: "/news", label: "News", icon: icon(
    "M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
    "M3 16h18", "M7 8h10", "M7 12h6",
  ) },
  { href: "/notifications", label: "Notifications", icon: icon(
    "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9",
    "M10.5 21a2 2 0 0 0 3 0",
  ) },
] as const;