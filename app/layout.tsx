import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "AgendOS",
  description: "Your personal operating system",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AgendOS",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `try{
            if(localStorage.getItem("agendos-theme")==="light")document.documentElement.dataset.theme="light";
            if(localStorage.getItem("agendos-lang")==="en")document.documentElement.lang="en";
          }catch(e){}`,
        }} />
      </head>
      <body><I18nProvider>{children}</I18nProvider></body>
    </html>
  );
}
