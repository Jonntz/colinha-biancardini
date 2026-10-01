import type { Metadata, Viewport } from "next";
import { Montserrat, Rubik } from "next/font/google";
import "./globals.css";

/** Texto da colinha (variável: 500–900). */
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

/** Título "MINHA COLINHA" (Rubik Bold Italic, medido no layout de referência). */
const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: "700",
  style: "italic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Minha Colinha · Eleições 2026",
  description:
    "Monte sua colinha para 4 de outubro: digite os números, confira nome, foto e partido direto do TSE e baixe a imagem no celular.",
  applicationName: "Minha Colinha",
  // Evita que o iOS transforme números (CNPJ, candidatos) em links de telefone.
  formatDetection: { telephone: false },
  openGraph: {
    title: "Minha Colinha · Eleições 2026",
    description: "Monte e baixe sua colinha eleitoral para 4 de outubro.",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#052e3f",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} ${rubik.variable} h-full`}>
      <body className="min-h-full bg-navy font-sans text-white antialiased sm:bg-navy-950">{children}</body>
    </html>
  );
}
