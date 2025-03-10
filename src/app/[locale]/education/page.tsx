import { Locale } from '@/lib/i18n';
import { Metadata } from 'next';

interface EducationPageProps {
  params: {
    locale: Locale;
  };
}

export function generateMetadata({ params }: EducationPageProps): Metadata {
  const locale = params.locale;
  return {
    title: locale === 'en' ? 'Education - A&B School' : 'Обучение - Школа А&Б',
    description: locale === 'en' 
      ? 'Learn about the educational programs and methodology at A&B School' 
      : 'Научете повече за учебните програми и методологията в Школа А&Б'
  };
}

export default function EducationPage({ params }: EducationPageProps) {
  const { locale } = params;
  
  return (
    <main className="py-10">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">
            {locale === 'en' ? 'Education at A&B School' : 'Обучение в Школа А&Б'}
          </h1>
          
          <div className="prose prose-lg max-w-none">
            {locale === 'en' ? (
              <>
                <h2>Our Methodology</h2>
                <p>
                  At A&B School, we employ a progressive teaching methodology that combines theoretical knowledge 
                  with practical applications. Our approach is student-centered, focusing on developing critical 
                  thinking, problem-solving abilities, and creativity.
                </p>
                
                <h2>Age Groups</h2>
                <p>
                  We offer programs for students from 2nd to 12th grade, with curricula tailored to each age group's 
                  learning capabilities and needs. Groups are formed based on students' grade level and proficiency, 
                  ensuring appropriate challenge and support for each individual.
                </p>
                
                <h2>Educational Process</h2>
                <p>
                  Classes are conducted in small groups, allowing teachers to provide individualized attention to 
                  each student. The curriculum covers standard material as well as advanced topics that prepare 
                  students for competitions and entrance exams. Regular assignments and practice tests help monitor 
                  progress and reinforce learning.
                </p>
              </>
            ) : (
              <>
                <h2>Нашата методика</h2>
                <p>
                  В Школа А&Б използваме прогресивна методика на преподаване, която съчетава теоретични знания 
                  с практически приложения. Нашият подход е центриран върху ученика, фокусирайки се върху развитието 
                  на критично мислене, умения за решаване на проблеми и креативност.
                </p>
                
                <h2>Възрастови групи</h2>
                <p>
                  Предлагаме програми за ученици от 2-ри до 12-ти клас, с учебни програми, пригодени към възможностите 
                  и нуждите на всяка възрастова група. Групите се формират на базата на класа и нивото на учениците, 
                  осигурявайки подходящо предизвикателство и подкрепа за всеки индивид.
                </p>
                
                <h2>Учебен процес</h2>
                <p>
                  Занятията се провеждат в малки групи, което позволява на учителите да предоставят индивидуално 
                  внимание на всеки ученик. Учебната програма обхваща стандартен материал, както и разширени теми, 
                  които подготвят учениците за състезания и кандидатстудентски изпити. Редовни задания и тестове за 
                  практика помагат за проследяване на напредъка и затвърждаване на наученото.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 