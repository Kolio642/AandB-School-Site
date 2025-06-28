import { Locale, locales } from '@/lib/i18n';
import { Metadata } from 'next';
import { Lightbulb, Users, GraduationCap, BookOpen, Code, Calculator } from 'lucide-react';

interface EducationPageProps {
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

export function generateMetadata({ params }: EducationPageProps): Metadata {
  const locale = params.locale;
  return {
    title: locale === 'en' ? 'Education - A&B School' : 'Обучение - Школа А&Б',
    description: locale === 'en' 
      ? 'Learn about the educational programs and methodology at A&B School' 
      : 'Научете повече за учебните програми и методологията в Школа А&Б'
  };
}

const FeatureCard = ({ icon, title, children }: { 
  icon: React.ReactNode, 
  title: string, 
  children: React.ReactNode 
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
    <div className="flex items-start gap-4">
      <div className="bg-primary/10 text-primary p-3 rounded-lg">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <div className="text-muted-foreground">
          {children}
        </div>
      </div>
    </div>
  </div>
);

const SubjectCard = ({ icon, title, description }: { 
  icon: React.ReactNode, 
  title: string,
  description: string
}) => (
  <div className="bg-primary/5 rounded-lg p-4 flex items-center gap-3">
    <div className="text-primary">
      {icon}
    </div>
    <div>
      <h4 className="font-medium">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default function EducationPage({ params }: EducationPageProps) {
  const { locale } = params;
  const isEN = locale === 'en';
  
  return (
    <main className="py-10">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              {isEN ? 'Education at A&B School' : 'Обучение в Школа А&Б'}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {isEN
                ? 'Our comprehensive approach to mathematics and informatics education'
                : 'Нашият всеобхватен подход към обучението по математика и информатика'}
            </p>
          </div>

          <div className="space-y-12">
            {/* Methodology Section */}
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Lightbulb className="h-6 w-6 text-primary" />
                {isEN ? 'Our Methodology' : 'Нашата методика'}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <FeatureCard 
                  icon={<BookOpen className="h-6 w-6" />} 
                  title={isEN ? 'Student-Centered Approach' : 'Подход, центриран върху ученика'}
                >
                  <p>
                    {isEN 
                      ? 'We focus on developing critical thinking, problem-solving abilities, and creativity in each student.'
                      : 'Фокусираме се върху развитието на критично мислене, умения за решаване на проблеми и креативност във всеки ученик.'}
                  </p>
                </FeatureCard>
                
                <FeatureCard 
                  icon={<Users className="h-6 w-6" />} 
                  title={isEN ? 'Small Group Learning' : 'Обучение в малки групи'}
                >
                  <p>
                    {isEN 
                      ? 'Classes are conducted in small groups, allowing teachers to provide individualized attention.'
                      : 'Занятията се провеждат в малки групи, което позволява на учителите да предоставят индивидуално внимание.'}
                  </p>
                </FeatureCard>
              </div>
            </section>
            
            {/* Age Groups Section */}
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-primary" />
                {isEN ? 'Age Groups' : 'Възрастови групи'}
              </h2>
              
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 shadow-sm">
                <p className="mb-6">
                  {isEN
                    ? 'We offer programs for students from 2nd to 12th grade, with curricula tailored to each age group\'s learning capabilities and needs.'
                    : 'Предлагаме програми за ученици от 2-ри до 12-ти клас, с учебни програми, пригодени към可能性 и нуждите на всяка възрастова група.'}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
                    <div className="text-lg font-medium text-primary">
                      {isEN ? 'Elementary' : 'Начален етап'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {isEN ? 'Grades 2-4' : 'Класове 2-4'}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
                    <div className="text-lg font-medium text-primary">
                      {isEN ? 'Middle School' : 'Прогимназиален етап'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {isEN ? 'Grades 5-7' : 'Класове 5-7'}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
                    <div className="text-lg font-medium text-primary">
                      {isEN ? 'High School' : 'Гимназиален етап'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {isEN ? 'Grades 8-12' : 'Класове 8-12'}
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Subjects Section */}
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-primary" />
                {isEN ? 'Core Subjects' : 'Основни предмети'}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <SubjectCard 
                  icon={<Calculator className="h-5 w-5" />}
                  title={isEN ? 'Mathematics' : 'Математика'}
                  description={isEN ? 'From basics to advanced topics' : 'От основи до напреднали теми'}
                />
                <SubjectCard 
                  icon={<Code className="h-5 w-5" />}
                  title={isEN ? 'Informatics' : 'Информатика'}
                  description={isEN ? 'Programming and algorithms' : 'Програмиране и алгоритми'}
                />
              </div>
            </section>
            
            {/* Educational Process Section */}
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-primary" />
                {isEN ? 'Educational Process' : 'Учебен процес'}
              </h2>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="mb-4">
                  {isEN
                    ? 'The curriculum covers standard material as well as advanced topics that prepare students for competitions and entrance exams. Regular assignments and practice tests help monitor progress and reinforce learning.'
                    : 'Учебната програма обхваща стандартен материал, както и разширени теми, които подготвят учениците за състезания и кандидатстудентски изпити. Редовни задания и тестове за практика помагат за проследяване на напредъка и затвърждаване на наученото.'}
                </p>
                
                <div className="grid sm:grid-cols-3 gap-4 mt-6">
                  <div className="flex flex-col items-center text-center p-4 border-t-2 border-primary">
                    <div className="text-lg font-medium mb-2">
                      {isEN ? 'Theory' : 'Теория'}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isEN ? 'Foundational concepts' : 'Основни концепции'}
                    </p>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 border-t-2 border-primary">
                    <div className="text-lg font-medium mb-2">
                      {isEN ? 'Practice' : 'Практика'}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isEN ? 'Applied problem-solving' : 'Приложно решаване на проблеми'}
                    </p>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 border-t-2 border-primary">
                    <div className="text-lg font-medium mb-2">
                      {isEN ? 'Competition' : 'Състезания'}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isEN ? 'Advanced preparation' : 'Разширена подготовка'}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
} 