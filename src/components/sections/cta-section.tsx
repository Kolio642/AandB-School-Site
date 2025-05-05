import Link from 'next/link';
import { Locale } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

interface CTASectionProps {
  locale: Locale;
}

export function CTASection({ locale }: CTASectionProps) {
  // Simulated translations
  const translations = {
    en: {
      title: "Join Our School Community",
      subtitle: "Take the first step towards providing your child with an exceptional educational experience",
      buttons: {
        contact: "Contact Us"
      }
    },
    bg: {
      title: "Присъединете се към нашата училищна общност",
      subtitle: "Направете първата стъпка към осигуряването на изключителен образователен опит за вашето дете",
      buttons: {
        contact: "Свържете се с нас"
      }
    }
  };
  
  // Use fallback mechanism to ensure we always have translations
  const t = locale && translations[locale as keyof typeof translations] 
    ? translations[locale as keyof typeof translations] 
    : translations.en;
  
  return (
    <section className="py-16 md:py-24 bg-primary text-primary-foreground">
      <div className="container">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
            {t.title}
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/80">
            {t.subtitle}
          </p>
          <div>
            <Button asChild size="lg" variant="secondary">
              <Link href={`/${locale}/contacts`}>
                {t.buttons.contact}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
} 