// Module registry. Future modules get `soon: true` and render disabled with a
// "Coming Soon" tag — add their entry to MODULES when implemented.
export const MODULES = [
  { href: "/", label: "Daily Brief", icon: "🏠" },
  { href: "/assistant", label: "AI Assistant", icon: "🤖" },
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/weather", label: "Weather", icon: "☁️" },
  { href: "/balance", label: "Balance", icon: "💰" },
] as const;

export const FUTURE_MODULES = [
  { label: "Notes", icon: "📝" },
  { label: "Health", icon: "❤️" },
  { label: "Maps", icon: "🗺️" },
  { label: "News", icon: "📰" },
  { label: "Email", icon: "✉️" },
] as const;
