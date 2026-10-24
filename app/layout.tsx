import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

// Carrega a fonte Manrope do Google Fonts e guarda ela na variável CSS --font-manrope
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "financeControl",
  description: "Controle de finanças pessoais",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={manrope.variable}>
      <body>{children}</body>
    </html>
  );
}