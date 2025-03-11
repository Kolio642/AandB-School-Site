import { Locale, locales } from '@/lib/i18n';
import { Metadata } from 'next';
import Image from 'next/image';

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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">
            {locale === 'en' ? 'About A&B School' : 'За Школа A&B'}
          </h1>
          
          <div className="prose prose-lg max-w-none">
            {locale === 'en' ? (
              <>
                <p>
                  A&B School of Mathematics and Informatics was established on April 1, 1998 in Shumen to support 
                  the extracurricular training of students from grades II to XII in mathematics, informatics, and 
                  information technologies.
                </p>
                <p>
                  Since its founding, our school has been dedicated to developing the potential of young students 
                  with interest and talent in mathematics and informatics. We provide a supportive environment where 
                  students can expand their knowledge beyond the standard curriculum and prepare for competitions 
                  and future academic success.
                </p>
                <p>
                  Our qualified teachers have extensive experience in both education and professional practice, 
                  ensuring that students receive the highest quality instruction. We take pride in our students' 
                  achievements at national and international competitions.
                </p>
              </>
            ) : (
              <>
                <p>
                  Школа за математика и информатика A&B е създадена на 01.04.1998 г. в гр. Шумен с цел подпомагане 
                  на извънучилищната подготовка на учениците от ІІ до XII клас по математика, информатика и 
                  информациони технологии.
                </p>
                <p>
                  От създаването си нашата школа е посветена на развитието на потенциала на млади ученици с интерес 
                  и талант в областта на математиката и информатиката. Предоставяме подкрепяща среда, в която 
                  учениците могат да разширят знанията си извън стандартната учебна програма и да се подготвят за 
                  състезания и бъдещ академичен успех.
                </p>
                <p>
                  Нашите квалифицирани учители имат богат опит както в образованието, така и в професионалната 
                  практика, гарантирайки, че учениците получават най-качественото обучение. Гордеем се с постиженията 
                  на нашите ученици на национални и международни състезания.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 