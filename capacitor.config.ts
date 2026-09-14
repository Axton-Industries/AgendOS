import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.agendos.app",
  appName: "AgendOS",
  webDir: "out",
  server: {
    androidScheme: "https",
    // The Android app loads the deployed Next.js backend (its API routes are
    // server-only, so the whole app runs remotely). Set CAPACITOR_SERVER_URL
    // at build time; an empty value makes the app load its bundled web assets.
    url: process.env.CAPACITOR_SERVER_URL || "",
  },
  ios: {
    contentInset: "always",
  },
};

export default config;