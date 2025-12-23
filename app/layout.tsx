import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NavidadSurvey - Encuesta de Regalos Navideños",
  description: "Cuéntanos sobre tus regalos de Navidad",
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
      <body>{children}</body>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
