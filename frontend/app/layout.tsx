import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from 'react-hot-toast';
import AuthInterceptorProvider from "@/components/AuthProvider";

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
    <html lang="pt-BR" data-theme='dark'>
      <body className={`${QuicksandText.variable} ${InterText.variable} antialiased`}>
        <AuthInterceptorProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#27272a',
                  color: '#ffffff',
                  border: '1px solid #3f3f46',
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
      </body>
    </html>
  );
}
