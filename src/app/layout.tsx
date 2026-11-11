import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Facturación CR",
  description:
    "Facturación electrónica de Costa Rica para trabajadores independientes que les cobran a clientes del exterior.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
