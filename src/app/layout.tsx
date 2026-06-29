import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import JsonLd from '@/components/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://paktourism.pk';

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'PAKEZY',
  url: SITE_URL,
  description: 'Smart Travel. Global Connection. Plan your dream journey to the mountains, cities, and cultural hearts of Pakistan.',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/destinations?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  name: 'PAKEZY',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: 'Smart Travel. Global Connection. Pakistan\'s #1 travel platform. Book hotels, tour packages, and find expert guides.',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'PK',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Pakistan',
  },
};

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'PAKEZY - Smart Travel. Global Connection.',
  description: 'Smart Travel. Global Connection. Plan your dream journey to the mountains, cities, and cultural hearts of Pakistan. Book hotels, tour packages, and find expert guides.',
  keywords: 'PAKEZY, Pakistan Tourism, Hunza Valley, Skardu, Lahore, Travel Pakistan, Tour Packages Pakistan',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans min-h-screen flex flex-col`}>
        <JsonLd data={[websiteSchema, organizationSchema]} />
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
