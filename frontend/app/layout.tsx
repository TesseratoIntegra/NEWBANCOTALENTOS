import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from 'react-hot-toast';
import AuthInterceptorProvider from "@/components/AuthProvider";
import { ThemeProvider } from 'next-themes';

const QuicksandText = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

const InterText = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Banco de Talentos - Chiaperini Industrial",
  description: "Plataforma completa para gestão de talentos e recrutamento",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${QuicksandText.variable} ${InterText.variable} antialiased`}>
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
          <AuthInterceptorProvider>
            <AuthProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1px solid #e2e8f0',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#ffffff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#ffffff',
                    },
                  },
                }}
              />
            </AuthProvider>
          </AuthInterceptorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
