import { Locale, locales } from '@/lib/i18n';
import { Metadata } from 'next';
import { HeroSection } from '@/components/sections/hero-section';
import { FeaturesSection } from '@/components/sections/features-section';
import { TestimonialsSection } from '@/components/sections/testimonials-section';
import { NewsSection } from '@/components/sections/news-section';
import { CTASection } from '@/components/sections/cta-section';

interface HomePageProps {
  params: {
    locale: Locale;
  };
}

// This function is required when using static export with dynamic routes
export function generateStaticParams() {
  return locales.map((locale) => ({
    locale,
  }));
}

export function generateMetadata({ params }: HomePageProps): Metadata {
  const locale = params.locale;
  return {
    title: locale === 'en' ? 'A&B School - Excellence in Education' : 'Училище А&Б - Отличие в образованието',
    description: locale === 'en' 
      ? 'A&B School provides quality education and fosters the development of young minds since 1995' 
      : 'Училище А&Б предоставя качествено образование и насърчава развитието на младите умове от 1995 г.'
  };
}

export default async function HomePage({ params: { locale } }: HomePageProps) {
  return (
    <main>
      <HeroSection locale={locale} />
      <FeaturesSection locale={locale} />
      <TestimonialsSection locale={locale} />
      <NewsSection locale={locale} />
      <CTASection locale={locale} />
    </main>
  );
} 