import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
});

export const metadata: Metadata = {
  title: 'Naploo - Premium Sleep Pods | Book Hourly Rest Spaces in India',
  description: 'Experience futuristic sleeping pods across India. Book by the hour at hotels, airports, and homestays. Premium comfort, affordable prices.',
  keywords: 'sleep pods, pod hotel, hourly rest, naploo, india travel, airport pods, capsule hotel',
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.svg',
  },
  openGraph: {
    title: 'Naploo - Premium Sleep Pods',
    description: 'Experience futuristic sleeping pods across India',
    images: ['/Pods_Images/For Website main images/Main Pods Image.png'],
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#0f172a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.variable} ${plusJakarta.variable} font-sans bg-naploo-dark text-white antialiased`}>
        <Navbar />
        <main className="pb-20 lg:pb-0">
          {children}
        </main>
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  );
}
