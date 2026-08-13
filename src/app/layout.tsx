import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./milestone-04.css";

export const metadata: Metadata = {
  title: { default: "Femmea", template: "%s · Femmea" },
  description: "Acompanhamento personalizado da jornada de inseminação.",
  manifest: "/manifest.webmanifest",
  applicationName: "Femmea",
  appleWebApp: { capable: true, title: "Femmea", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#7B4AA6",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
