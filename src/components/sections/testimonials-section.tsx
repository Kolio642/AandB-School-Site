import { Locale } from '@/lib/i18n';
import { Quote } from 'lucide-react';

interface TestimonialsSectionProps {
  locale: Locale;
}

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
}

function Testimonial({ quote, author, role }: TestimonialProps) {
  return (
    <div className="flex flex-col p-6 bg-card rounded-lg shadow-sm">
      <div className="mb-4 text-primary">
        <Quote className="h-8 w-8" />
      </div>
      <blockquote className="mb-4 text-lg italic">"{quote}"</blockquote>
      <div className="mt-auto">
        <div className="font-semibold">{author}</div>
        <div className="text-sm text-muted-foreground">{role}</div>
      </div>
    </div>
  );
}

export function TestimonialsSection({ locale }: TestimonialsSectionProps) {
  // Simulated translations
  const translations = {
    en: {
      title: "What Our Community Says",
      subtitle: "Hear from our students, parents, and alumni about their experience at School A&B",
      testimonials: [
        {
          quote: "School A&B provided my child with exceptional education and a supportive environment that helped them grow both academically and personally.",
          author: "Maria Johnson",
          role: "Parent"
        },
        {
          quote: "The teachers at School A&B are truly dedicated to their students' success. They go above and beyond to ensure each student reaches their full potential.",
          author: "David Smith",
          role: "Former Student"
        },
        {
          quote: "The curriculum at School A&B prepared me exceptionally well for university. I developed critical thinking skills that have been invaluable in my career.",
          author: "Elena Petrova",
          role: "Alumna"
        }
      ]
    },
    bg: {
      title: "Какво казва нашата общност",
      subtitle: "Чуйте от нашите ученици, родители и възпитаници за техния опит в Школа A&B",
      testimonials: [
        {
          quote: "Школа A&B предостави на детето ми изключително образование и подкрепяща среда, която му помогна да се развие както академично, така и личностно.",
          author: "Мария Иванова",
          role: "Родител"
        },
        {
          quote: "Учителите в Школа A&B са истински отдадени на успеха на своите ученици. Те правят всичко възможно, за да гарантират, че всеки ученик достига пълния си потенциал.",
          author: "Димитър Петров",
          role: "Бивш ученик"
        },
        {
          quote: "Учебната програма в Школа A&B ме подготви изключително добре за университета. Развих умения за критично мислене, които са безценни в моята кариера.",
          author: "Елена Петрова",
          role: "Възпитаничка"
        }
      ]
    }
  };

  const t = translations[locale as keyof typeof translations];

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
            {t.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t.subtitle}
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {t.testimonials.map((testimonial, index) => (
            <Testimonial
              key={index}
              quote={testimonial.quote}
              author={testimonial.author}
              role={testimonial.role}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 