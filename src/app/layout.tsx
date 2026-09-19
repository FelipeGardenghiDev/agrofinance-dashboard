import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://agrofinance-dashboard-dev.vercel.app"),
  title: {
    default: "AgroFinance — Plataforma de Crédito e Ativos Tokenizados (RWA)",
    template: "%s | AgroFinance",
  },
  description:
    "Plataforma financeira de custódia, crédito e gestão de Real World Assets (RWA) do agronegócio: commodities tokenizadas, CPR Digital e derivativos B3.",
  keywords: [
    "AgroFinance",
    "RWA",
    "Real World Assets",
    "Agronegócio",
    "Crédito Rural",
    "CPR Digital",
    "Tokenização",
    "Soja",
    "Milho",
    "Derivativos B3",
    "Hedge Cambial",
    "Fintech",
    "Next.js 16",
    "TypeScript",
  ],
  authors: [{ name: "Felipe Gardenghi", url: "https://github.com/felipegardenghidev" }],
  creator: "Felipe Gardenghi",
  publisher: "AgroFinance Technologies",
  applicationName: "AgroFinance",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "AgroFinance — Plataforma de Crédito e Ativos Tokenizados (RWA)",
    description:
      "Plataforma bancária e de gestão de RWA do agronegócio: custódia de safras, CPR Digital, derivativos B3 e Modo Campo PWA.",
    url: "https://agrofinance-dashboard-dev.vercel.app",
    siteName: "AgroFinance RWA",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgroFinance — Plataforma de Crédito e Ativos Tokenizados (RWA)",
    description:
      "Plataforma bancária e de gestão de RWA do agronegócio: custódia de safras, CPR Digital, derivativos B3 e Modo Campo PWA.",
    creator: "@FelipeGardenghi",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AgroFinance",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storage = localStorage.getItem('agrofinance-storage-v1');
                if (storage) {
                  const parsed = JSON.parse(storage);
                  const theme = parsed?.state?.theme;
                  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-agro-branco dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-150`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
