import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'RSS Vision - Modern RSS Reader',
  description: 'A modern RSS feed reader with Vision OS-inspired design',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="min-h-screen bg-background">
              {children}
            </div>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
