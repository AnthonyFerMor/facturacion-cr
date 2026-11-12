import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--fuente-sans",
});

// La monoespaciada solo aparece en claves y números de comprobante: no se precarga.
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--fuente-mono",
  preload: false,
});

export const metadata: Metadata = {
  title: "Facturación CR",
  description:
    "Facturación electrónica de Costa Rica para trabajadores independientes que les cobran a clientes del exterior.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
