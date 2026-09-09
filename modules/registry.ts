// Module registry. Future modules get `soon: true` and render disabled with a
// "Coming Soon" tag — add their entry to MODULES when implemented.
export const MODULES = [
  { href: "/", label: "Daily Brief", icon: "🏠" },
  { href: "/assistant", label: "AI Assistant", icon: "🤖" },
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/weather", label: "Weather", icon: "☁️" },
  { href: "/balance", label: "Balance", icon: "💰" },
  { href: "/notes", label: "Notes", icon: "📝" },
  { href: "/health", label: "Health", icon: "❤️" },
  { href: "/maps", label: "Maps", icon: "🗺️" },
  { href: "/news", label: "News", icon: "📰" },
  { href: "/notifications", label: "Notifications", icon: "✉️" },
] as const;



