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
  
  const t = translations[locale as keyof typeof translations];
  
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10 opacity-20 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      {/* Colored gradients */}
      <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[100px] opacity-60"></div>
      <div className="absolute bottom-0 left-0 -z-10 h-[300px] w-[300px] rounded-full bg-purple-500/20 blur-[100px] opacity-60"></div>
      
      <div className="container relative z-10">
        <div 
          className={`grid gap-12 md:grid-cols-2 md:gap-16 items-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="flex flex-col gap-6">
            <div className="space-y-6">
              <h1 className="text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {t.title}
              </h1>
              <p className="text-xl text-muted-foreground md:text-2xl">
                {t.subtitle}
              </p>
              <p className="text-base text-muted-foreground max-w-md">
                {t.description}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300"
              >
                <Link href={`/${locale}/about`}>
                  {t.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={`/${locale}/contacts`}>
                  {t.contact}
                </Link>
              </Button>
            </div>
            
            {/* Stats section */}
            <div 
              className={`grid grid-cols-3 gap-4 mt-6 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            >
              {t.stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="p-4 bg-background/50 backdrop-blur-sm border border-border rounded-lg shadow-sm"
                >
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div 
            className={`relative h-[300px] md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden shadow-2xl transition-all duration-1000 delay-150 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-600/10 z-10 rounded-lg"></div>
            <Image
              src="/images/hero-image.jpg"
              alt={locale === 'en' ? 'School A&B' : 'Школа A&B'}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
} 