'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Locale } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HeroSectionProps {
  locale: Locale;
}

export function HeroSection({ locale }: HeroSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  // Animation effect on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Simulated translations - in a real app, we would use the getTranslations function
  // but for compatibility with the existing locale files, we're hardcoding the values
  const translations = {
    en: {
      title: "School A&B",
      subtitle: "Preparing future professionals in the field of programming",
      description: "Join our comprehensive educational programs designed to foster creativity, critical thinking, and technical excellence in mathematics and informatics.",
      cta: "Learn More",
      contact: "Contact Us",
      stats: [
        { value: "25+", label: "Years Experience" },
        { value: "500+", label: "Students Taught" },
        { value: "100%", label: "Satisfaction Rate" }
      ]
    },
    bg: {
      title: "Школа A&B",
      subtitle: "Подготовка на бъдещи професионалисти в областта на програмирането",
      description: "Присъединете се към нашите образователни програми, създадени да стимулират креативността, критичното мислене и техническите умения по математика и информатика.",
      cta: "Научете повече",
      contact: "Свържете се с нас",
      stats: [
        { value: "25+", label: "Години опит" },
        { value: "500+", label: "Обучени ученици" },
        { value: "100%", label: "Удовлетвореност" }
      ]
    }
  };
  
  // Use fallback mechanism to ensure we always have translations
  const t = locale && translations[locale as keyof typeof translations] 
    ? translations[locale as keyof typeof translations] 
    : translations.en;
  
  return (
    <section className="relative overflow-hidden py-12 md:py-20 lg:py-28">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10 opacity-20 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      {/* Colored gradients */}
      <div className="absolute top-0 right-0 -z-10 h-[300px] md:h-[600px] w-[300px] md:w-[600px] rounded-full bg-primary/20 blur-[100px] opacity-60"></div>
      <div className="absolute bottom-0 left-0 -z-10 h-[200px] md:h-[300px] w-[200px] md:w-[300px] rounded-full bg-purple-500/20 blur-[100px] opacity-60"></div>
      
      <div className="container relative z-10 px-4 sm:px-6">
        <div 
          className={`grid gap-8 md:grid-cols-2 md:gap-16 items-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="space-y-4 md:space-y-6">
              <h1 className="text-3xl xs:text-4xl sm:text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent leading-tight">
                {t.title}
              </h1>
              <p className="text-base xs:text-lg sm:text-xl text-muted-foreground md:text-2xl leading-snug">
                {t.subtitle}
              </p>
              <p className="text-xs xs:text-sm md:text-base text-muted-foreground max-w-md leading-relaxed">
                {t.description}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2 md:mt-4">
              <Button 
                asChild 
                size="lg" 
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300"
              >
                <Link href={`/${locale}/about`}>
                  {t.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href={`/${locale}/contacts`}>
                  {t.contact}
                </Link>
              </Button>
            </div>
            
            {/* Stats section */}
            <div 
              className={`flex flex-wrap mt-2 md:mt-6 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            >
              {t.stats.map((stat, index) => (
                <div 
                  key={index} 
                  className={`p-2 bg-background/50 backdrop-blur-sm border border-border rounded-lg shadow-sm mx-0.5 mb-1 ${
                    index === 0 ? 'w-[48.5%] xs:w-[32%]' : 
                    index === 1 ? 'w-[48.5%] xs:w-[32%]' : 
                    'w-[99%] xs:w-[32%] flex flex-col items-center text-center'
                  }`}
                >
                  <p className="text-lg font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div 
            className={`hidden sm:block relative h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] rounded-xl overflow-hidden shadow-2xl transition-all duration-1000 delay-150 border-2 border-white/30 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-700/20 mix-blend-overlay z-10 rounded-lg hidden sm:block"></div>
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 shadow-inner"></div>
            <div className="absolute bottom-0 left-0 right-0 h-1/6 bg-gradient-to-t from-black/40 to-transparent z-10"></div>
            <div className="absolute bottom-4 left-4 z-20 text-white text-sm font-medium px-3 py-1 bg-black/30 backdrop-blur-sm rounded-full">
              {locale === 'en' ? 'A&B School Students' : 'Ученици на Школа A&B'}
            </div>
            <Image
              src="/images/gallery/students-group.jpg"
              alt={locale === 'en' ? 'A&B School Students' : 'Ученици на Школа A&B'}
              fill
              priority
              loading="eager"
              quality={90}
              className="object-cover object-center hover:scale-105 transition-transform duration-5000"
              sizes="(max-width: 640px) 90vw, (max-width: 768px) 95vw, (max-width: 1024px) 50vw, 50vw"
              fetchPriority="high"
            />
          </div>
        </div>
      </div>
    </section>
  );
} 