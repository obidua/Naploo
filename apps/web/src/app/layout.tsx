import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#ffffff',
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://naploo.com'),
  title: {
    default: 'Naploo - Premium Sleep Pods in India | Book Hourly Rest Spaces',
    template: '%s | Naploo',
  },
  description: "India's first premium sleep pod network. Book futuristic sleeping pods by the hour at airports, railway stations, hotels & malls. Starting ₹99/hour. WiFi, AC, privacy guaranteed.",
  keywords: [
    'sleep pods India',
    'pod hotels',
    'hourly rest',
    'naploo',
    'capsule hotel India',
    'airport sleeping pods',
    'nap pods',
    'rest pods',
    'sleeping capsule',
    'short stay pods',
    'hourly booking',
    'transit accommodation',
    'pod accommodation',
    'sleep booth',
    'rest cabin',
  ],
  authors: [{ name: 'Naploo', url: 'https://naploo.com' }],
  creator: 'Naploo',
  publisher: 'Naploo',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Naploo',
    startupImage: '/apple-splash.png',
  },
  formatDetection: {
    telephone: true,
    date: false,
    email: true,
    address: false,
  },
  openGraph: {
    title: 'Naploo - Premium Sleep Pods in India',
    description: "India's first premium sleep pod network. Book futuristic pods by the hour. Starting ₹99/hour.",
    url: 'https://naploo.com',
    siteName: 'Naploo',
    locale: 'en_IN',
    type: 'website',
    images: [{
      url: '/Pods_Images/For Website main images/Main Pods Image.png',
      width: 1200,
      height: 630,
      alt: 'Naploo Premium Sleep Pod - Futuristic Rest Solution',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Naploo - Premium Sleep Pods in India',
    description: "Book futuristic sleeping pods by the hour. Starting ₹99/hour.",
    images: ['/Pods_Images/For Website main images/Main Pods Image.png'],
    creator: '@biduaind',
    site: '@biduaind',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'Travel',
  classification: 'Accommodation Services',
  alternates: {
    canonical: 'https://naploo.com',
    languages: {
      'en-IN': 'https://naploo.com',
    },
  },
};

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Naploo',
  description: "India's first premium sleep pod network offering hourly rest spaces at airports, railway stations, and hotels.",
  url: 'https://naploo.com',
  logo: 'https://naploo.com/logo.png',
  sameAs: [
    'https://x.com/biduaind',
    'https://www.instagram.com/biduaindustries/',
    'https://www.facebook.com/profile.php?id=61591099795161',
    'https://wa.me/919512921903',
    'https://biduapods.com',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-XXXXXXXXXX',
    contactType: 'customer service',
    availableLanguage: ['English', 'Hindi'],
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'IN',
  },
};

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  name: 'Naploo Sleep Pods',
  description: 'Premium sleep pod network offering hourly rest spaces',
  url: 'https://naploo.com',
  priceRange: '₹99 - ₹499',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'IN',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '1250',
  },
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'Air Conditioning', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Free WiFi', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Smart TV', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'USB Charging', value: true },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Naploo" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body className={inter.variable + ' ' + plusJakarta.variable + ' font-sans bg-white text-slate-800 antialiased overflow-x-hidden'}>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
