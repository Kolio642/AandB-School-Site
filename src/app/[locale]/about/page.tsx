import { Locale, locales } from '@/lib/i18n';
import { Metadata } from 'next';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface AboutPageProps {
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

export function generateMetadata({ params }: AboutPageProps): Metadata {
  const locale = params.locale;
  return {
    title: locale === 'en' ? 'About - A&B School' : 'За нас - Школа A&B',
    description: locale === 'en' 
      ? 'Learn about A&B School, our history, mission, and values' 
      : 'Научете повече за Школа A&B, нашата история, мисия и ценности'
  };
}

export default function AboutPage({ params }: AboutPageProps) {
  const { locale } = params;
  
  return (
    <main className="py-10">
      <div className="container">
        {/* Hero section */}
        <div className="relative w-full rounded-xl overflow-hidden mb-16">
          <div className="relative h-[300px] md:h-[400px] w-full">
            <Image 
              src="/images/about-hero.jpg" 
              alt={locale === 'en' ? "About A&B School" : "За Школа A&B"}
              fill
              className="object-cover brightness-75"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent">
              <div className="container h-full flex flex-col justify-center">
                <div className="max-w-lg text-white p-6 md:p-10">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    {locale === 'en' ? 'About A&B School' : 'За Школа A&B'}
                  </h1>
                  <p className="text-lg md:text-xl opacity-90">
                    {locale === 'en' 
                      ? 'Excellence in mathematics and informatics education since 1998' 
                      : 'Отличие в обучението по математика и информатика от 1998 г.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Main content */}
          <div className="grid md:grid-cols-5 gap-10 mb-16">
            <div className="md:col-span-3">
              <div className="prose prose-lg max-w-none">
                {locale === 'en' ? (
                  <>
                    <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                    <p className="text-lg">
                      A&B School of Mathematics and Informatics was established on April 1, 1998 in Shumen to support 
                      the extracurricular training of students from grades II to XII in mathematics, informatics, and 
                      information technologies.
                    </p>
                    <p className="text-lg">
                      Since its founding, our school has been dedicated to developing the potential of young students 
                      with interest and talent in mathematics and informatics. We provide a supportive environment where 
                      students can expand their knowledge beyond the standard curriculum and prepare for competitions 
                      and future academic success.
                    </p>
                    <p className="text-lg">
                      Our qualified teachers have extensive experience in both education and professional practice, 
                      ensuring that students receive the highest quality instruction. We take pride in our students' 
                      achievements at national and international competitions.
                    </p>
                  </>
                ) :
                  <>
                    <h2 className="text-3xl font-bold mb-6">Нашата история</h2>
                    <p className="text-lg">
                      Школа за математика и информатика A&B е създадена на 01.04.1998 г. в гр. Шумен с цел подпомагане 
                      на извънучилищната подготовка на учениците от ІІ до XII клас по математика, информатика и 
                      информациони технологии.
                    </p>
                    <p className="text-lg">
                      От създаването си нашата школа е посветена на развитието на потенциала на млади ученици с интерес 
                      и талант в областта на математиката и информатиката. Предоставяме подкрепяща среда, в която 
                      учениците могат да разширят знанията си извън стандартната учебна програма и да се подготвят за 
                      състезания и бъдещ академичен успех.
                    </p>
                    <p className="text-lg">
                      Нашите квалифицирани учители имат богат опит както в образованието, така и в професионалната 
                      практика, гарантирайки, че учениците получават най-качественото обучение. Гордеем се с постиженията 
                      на нашите ученици на национални и международни състезания.
                    </p>
                  </>
                }
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="bg-primary/5 rounded-xl p-6 shadow-sm border border-primary/10">
                <h3 className="text-xl font-semibold mb-4">
                  {locale === 'en' ? 'Our Mission' : 'Нашата мисия'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {locale === 'en' 
                    ? 'To inspire and nurture the next generation of mathematicians and computer scientists through excellent education and mentorship.' 
                    : 'Да вдъхновяваме и развиваме следващото поколение математици и компютърни специалисти чрез отлично образование и менторство.'}
                </p>
                <h3 className="text-xl font-semibold mb-4">
                  {locale === 'en' ? 'Core Values' : 'Основни ценности'}
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center">
                    <span className="bg-primary/10 text-primary rounded-full p-1 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </span>
                    {locale === 'en' ? 'Excellence' : 'Отличие'}
                  </li>
                  <li className="flex items-center">
                    <span className="bg-primary/10 text-primary rounded-full p-1 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </span>
                    {locale === 'en' ? 'Innovation' : 'Иновация'}
                  </li>
                  <li className="flex items-center">
                    <span className="bg-primary/10 text-primary rounded-full p-1 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </span>
                    {locale === 'en' ? 'Critical Thinking' : 'Критично мислене'}
                  </li>
                  <li className="flex items-center">
                    <span className="bg-primary/10 text-primary rounded-full p-1 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </span>
                    {locale === 'en' ? 'Ethical Approach' : 'Етичен подход'}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA section */}
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-between bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 md:p-8 shadow-sm">
            <div>
              <h3 className="text-2xl font-bold mb-2">
                {locale === 'en' ? 'Want to learn more?' : 'Искате да научите повече?'}
              </h3>
              <p className="text-muted-foreground">
                {locale === 'en' 
                  ? 'Explore our educational programs or contact us directly' 
                  : 'Разгледайте нашите образователни програми или се свържете с нас директно'}
              </p>
            </div>
            <div className="flex gap-4">
              <Button asChild>
                <Link href={`/${locale}/education`}>
                  {locale === 'en' ? 'Our Programs' : 'Нашите програми'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/${locale}/contacts`}>
                  {locale === 'en' ? 'Contact Us' : 'Свържете се с нас'}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 