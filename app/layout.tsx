import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "P-Bot - Encuesta y Reporte",
  description: "Sistema de encuestas y reportes con dashboard CEO",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
