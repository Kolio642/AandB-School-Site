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
        apply: "Apply Now",
        contact: "Contact Us"
      }
    },
    bg: {
      title: "Присъединете се към нашата училищна общност",
      subtitle: "Направете първата стъпка към осигуряването на изключителен образователен опит за вашето дете",
      buttons: {
        apply: "Кандидатствайте сега",
        contact: "Свържете се с нас"
      }
    }
  };
  
  const t = translations[locale as keyof typeof translations];
  
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
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link href={`/${locale}/admissions`}>
                {t.buttons.apply}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
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