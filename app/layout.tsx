import './globals.css';
import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const display = Cormorant_Garamond({ subsets: ['latin'], weight: '700', variable: '--font-display' });

export const metadata: Metadata = {
  title: 'Celebrate AI',
  description: 'Celebration and event planner',
  icons: {
    icon: '/icon.svg'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${display.variable} bg-background font-sans text-foreground antialiased`}>{children}</body>
    </html>
  );
}
