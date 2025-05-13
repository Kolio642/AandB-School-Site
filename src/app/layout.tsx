import '../styles/globals.css';
import { locales } from '@/lib/i18n';
import type { Metadata } from 'next';
import { Inter, Montserrat, JetBrains_Mono } from 'next/font/google';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from '@/components/ui/toaster';

// Load and configure fonts
const inter = Inter({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  variable: '--font-montserrat',
  display: 'swap',
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: true,
});

/**
 * Base metadata for the application
 */
export const metadata: Metadata = {
  title: {
    default: 'A&B School',
    template: '%s | A&B School',
  },
  description: 'School of Mathematics and Informatics A&B - Shumen',
  keywords: ['school', 'mathematics', 'informatics', 'programming', 'C++', 'Shumen', 'education', 'competitions'],
  authors: [{ name: 'A&B School' }],
  creator: 'A&B School',
  publisher: 'A&B School',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/images/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/images/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: '48x48' }
    ],
    apple: [
      { url: '/images/favicons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { url: '/images/favicons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/favicons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
    ]
  },
  manifest: '/images/favicons/site.webmanifest',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Root layout that provides fonts to all routes
 * 
 * @param children - The child components to render
 * @returns The root layout component
 */
export default function RootLayout({ children }: RootLayoutProps) {
  try {
    return (
      <html 
        lang="en" 
        suppressHydrationWarning
      >
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
          <meta 
            httpEquiv="Content-Security-Policy" 
            content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://*.supabase.co; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' https: data:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://*.supabase.in https: wss://*.supabase.co; frame-src 'self' https://*.supabase.co;" 
          />
          <meta httpEquiv="X-DNS-Prefetch-Control" content="on" />
          <link rel="dns-prefetch" href="https://unpkg.com" />
          <link rel="preconnect" href="https://unpkg.com" />
          
          {/* Remove preload for hero image to prevent unused resource warning */}
          <meta name="theme-color" content="#4f46e5" />
          <meta httpEquiv="Cache-Control" content="max-age=86400" />
        </head>
        <body className={`${inter.variable} ${montserrat.variable} ${jetbrainsMono.variable} font-sans min-h-screen flex flex-col`}>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </body>
      </html>
    );
  } catch (error) {
    console.error('Critical error in root layout:', error);
    
    // Return minimal HTML structure in case of critical error
    return (
      <html lang="en">
        <head>
          <title>Error - A&B School</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body className="font-sans min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 text-gray-900">
          <main className="max-w-md p-6 bg-white border rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Critical Error</h1>
            <p className="mb-4">Sorry, something went wrong while loading the application.</p>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </main>
        </body>
      </html>
    );
  }
}

/**
 * Generate static params for locale
 * @returns An array of locale params for static generation
 */
export async function generateStaticParams() {
  try {
    return locales.map((locale) => ({ locale }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
} 