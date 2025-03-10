import { Locale } from '@/lib/i18n';
import { BookOpen, Users, Award, GraduationCap } from 'lucide-react';

interface FeaturesSectionProps {
  locale: Locale;
}

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function Feature({ icon, title, description }: FeatureProps) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card shadow-sm">
      <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

export function FeaturesSection({ locale }: FeaturesSectionProps) {
  // Simulated translations
  const translations = {
    en: {
      title: "Why Choose School A&B",
      subtitle: "We provide comprehensive training in mathematics, informatics, and information technologies",
      features: [
        {
          title: "Modern Curriculum",
          description: "Our curriculum is designed to meet international standards while focusing on individual student needs"
        },
        {
          title: "Expert Teachers",
          description: "Our teachers are highly qualified professionals dedicated to nurturing student potential"
        },
        {
          title: "Outstanding Results",
          description: "Our students consistently achieve excellent results in national and international competitions"
        },
        {
          title: "Modern Facilities",
          description: "Our school is equipped with state-of-the-art facilities to enhance the learning experience"
        }
      ]
    },
    bg: {
      title: "Защо да изберете Школа A&B",
      subtitle: "Предлагаме цялостно обучение по математика, информатика и информационни технологии",
      features: [
        {
          title: "Модерна учебна програма",
          description: "Нашата учебна програма е разработена да отговаря на международните стандарти, като същевременно се фокусира върху индивидуалните нужди на учениците"
        },
        {
          title: "Експертни учители",
          description: "Нашите учители са висококвалифицирани професионалисти, посветени на развитието на потенциала на учениците"
        },
        {
          title: "Изключителни резултати",
          description: "Нашите ученици постоянно постигат отлични резултати в национални и международни състезания"
        },
        {
          title: "Модерни съоръжения",
          description: "Нашето училище е оборудвано със съвременни съоръжения за подобряване на учебния опит"
        }
      ]
    }
  };
  
  const t = translations[locale as keyof typeof translations];
  
  const featureIcons = [
    <BookOpen key="curriculum" className="h-6 w-6" />,
    <Users key="teachers" className="h-6 w-6" />,
    <Award key="achievements" className="h-6 w-6" />,
    <GraduationCap key="facilities" className="h-6 w-6" />,
  ];
  
  const features = t.features.map((feature, index) => ({
    ...feature,
    icon: featureIcons[index]
  }));

  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
            {t.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t.subtitle}
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Feature
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 