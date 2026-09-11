import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgendOS",
  description: "Your personal operating system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `try{if(localStorage.getItem("agendos-theme")==="light")document.documentElement.dataset.theme="light"}catch(e){}`,
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
