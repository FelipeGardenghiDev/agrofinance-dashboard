import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "AgroFinance — Plataforma de Crédito e Ativos Tokenizados (RWA)",
  description: "Plataforma financeira de custódia, crédito e gestão de ativos tokenizados (RWA) do agronegócio.",
  applicationName: "AgroFinance",
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
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches) || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  document.documentElement.classList.add('dark');
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
      </body>
    </html>
  );
}
