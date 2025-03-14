/**
 * Database Seeding Script for A&B School Website
 * 
 * This script is used to populate the Supabase database with initial data.
 * It inserts sample news and achievements for demonstration purposes.
 * 
 * Prerequisites:
 * - Node.js installed
 * - Supabase project set up
 * - SUPABASE_URL and SUPABASE_ANON_KEY environment variables set
 * 
 * Usage:
 * 1. Set environment variables:
 *    - SUPABASE_URL=your_supabase_url
 *    - SUPABASE_ANON_KEY=your_supabase_anon_key
 * 
 * 2. Run with Node.js:
 *    node database/seed.js
 */

const { createClient } = require('@supabase/supabase-js');

// Environment variables check
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Required environment variables SUPABASE_URL and SUPABASE_ANON_KEY are not set.');
  console.error('Please set these environment variables and try again.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const newsItems = [
  {
    title_en: 'New Computer Lab Opens at A&B School',
    title_bg: 'Нова компютърна лаборатория открита в Школа А&Б',
    summary_en: 'State-of-the-art computer lab with 20 workstations opens to enhance student learning in technology and programming.',
    summary_bg: 'Съвременна компютърна лаборатория с 20 работни станции отваря врати, за да подобри обучението на учениците по технологии и програмиране.',
    content_en: '<p>We are excited to announce the opening of our new state-of-the-art computer lab. The facility is equipped with 20 high-performance workstations, interactive displays, and the latest software tools for programming and design.</p><p>This investment in technology will significantly enhance our students\' learning experience and prepare them for future careers in computer science and technology.</p><p>Classes in the new lab will begin next week, with a focus on programming, web development, and computer graphics.</p>',
    content_bg: '<p>С радост обявяваме откриването на нашата нова съвременна компютърна лаборатория. Съоръжението е оборудвано с 20 високопроизводителни работни станции, интерактивни дисплеи и най-новите софтуерни инструменти за програмиране и дизайн.</p><p>Тази инвестиция в технологии значително ще подобри учебния опит на нашите ученици и ще ги подготви за бъдещи кариери в компютърните науки и технологиите.</p><p>Занятията в новата лаборатория ще започнат следващата седмица, с фокус върху програмиране, уеб разработка и компютърна графика.</p>',
    date: '2023-09-15',
    image: '/images/news/computer-lab.jpg',
    published: true
  },
  {
    title_en: 'A&B School Students Win Regional Math Competition',
    title_bg: 'Ученици от Школа А&Б печелят регионално състезание по математика',
    summary_en: 'Our students brought home three gold medals and two silver medals from the Regional Mathematics Competition.',
    summary_bg: 'Нашите ученици донесоха три златни медала и два сребърни медала от Регионалното състезание по математика.',
    content_en: '<p>We are proud to announce that A&B School students have achieved outstanding results at the Regional Mathematics Competition held last weekend.</p><p>Our team of 10 students participated in various age categories, bringing home a total of 5 medals:</p><ul><li>3 gold medals in the high school division</li><li>2 silver medals in the middle school division</li></ul><p>These achievements reflect the dedication of our students and the excellence of our mathematics program. We extend our congratulations to all participants and thank our teachers for their guidance and support.</p>',
    content_bg: '<p>С гордост обявяваме, че учениците от Школа А&Б постигнаха изключителни резултати на Регионалното състезание по математика, проведено миналия уикенд.</p><p>Нашият отбор от 10 ученици участва в различни възрастови категории, донасяйки общо 5 медала:</p><ul><li>3 златни медала в гимназиалния раздел</li><li>2 сребърни медала в прогимназиалния раздел</li></ul><p>Тези постижения отразяват всеотдайността на нашите ученици и високото качество на нашата програма по математика. Поздравяваме всички участници и благодарим на нашите учители за тяхното ръководство и подкрепа.</p>',
    date: '2023-10-20',
    image: '/images/news/math-competition.jpg',
    published: true
  },
  {
    title_en: 'Registration Open for Summer Coding Camp',
    title_bg: 'Отворена регистрация за летен лагер по програмиране',
    summary_en: 'Register now for our annual summer coding camp for students ages 10-17. Learn programming, game development, and more!',
    summary_bg: 'Регистрирайте се сега за нашия годишен летен лагер по програмиране за ученици на възраст 10-17 години. Научете програмиране, разработка на игри и още!',
    content_en: '<p>Registration is now open for our annual Summer Coding Camp! The camp will run from July 15 to August 5, 2023, and is open to students ages 10-17.</p><p>This year\'s program includes:</p><ul><li>Introduction to Programming</li><li>Web Development</li><li>Game Development</li><li>Robotics</li><li>Data Science for Beginners</li></ul><p>Students will work on real projects under the guidance of experienced instructors. The camp concludes with a showcase where students present their projects to parents and peers.</p><p>Early bird registration discount available until May 31. Limited spots available, so register today!</p>',
    content_bg: '<p>Регистрацията за нашия годишен Летен лагер по програмиране е вече отворена! Лагерът ще се проведе от 15 юли до 5 август 2023 г. и е отворен за ученици на възраст 10-17 години.</p><p>Програмата за тази година включва:</p><ul><li>Въведение в програмирането</li><li>Уеб разработка</li><li>Разработка на игри</li><li>Роботика</li><li>Наука за данните за начинаещи</li></ul><p>Учениците ще работят по реални проекти под提醒大家 на опитни инструктори. Лагерът завършва с изложба, където учениците представят своите проекти пред родители и връстници.</p><p>Отстъпка за ранна регистрация е налична до 31 май. Местата са ограничени, така че се регистрирайте днес!</p>',
    date: '2023-04-25',
    image: '/images/news/coding-camp.jpg',
    published: true
  }
];

const achievements = [
  {
    title_en: 'First Place in National Mathematics Olympiad',
    title_bg: 'Първо място на Национална олимпиада по математика',
    description_en: '<p>Our student Maria Ivanova won first place in the National Mathematics Olympiad for high school students. This is a remarkable achievement that showcases her exceptional talent and hard work in mathematics.</p><p>The competition consisted of challenging problems that required deep mathematical thinking and creative problem-solving approaches. Maria\'s solution to the final round\'s most difficult problem was particularly praised by the jury.</p>',
    description_bg: '<p>Нашата ученичка Мария Иванова спечели първо място на Националната олимпиада по математика за гимназисти. Това е забележително постижение, което показва нейния изключителен талант и усърдна работа в областта на математиката.</p><p>Състезанието се състоеше от предизвикателни задачи, които изискваха задълбочено математическо мислене и творчески подходи за решаване на проблеми. Решението на Мария на най-трудната задача от финалния кръг беше особено похвалено от журито.</p>',
    date: '2023-05-15',
    student_name: 'Maria Ivanova',
    category: 'Math Competition',
    image: '/images/achievements/math-olympiad.jpg',
    published: true
  },
  {
    title_en: 'Bronze Medal at International Informatics Competition',
    title_bg: 'Бронзов медал на Международно състезание по информатика',
    description_en: '<p>Our student Petar Georgiev won a bronze medal at the International Informatics Competition. This achievement demonstrates the high level of programming and algorithmic thinking taught at our school.</p><p>The competition included participants from 45 countries, making this achievement even more significant. Petar\'s innovative approach to algorithm optimization impressed the judges and secured his place among the top performers.</p>',
    description_bg: '<p>Нашият ученик Петър Георгиев спечели бронзов медал на Международното състезание по информатика. Това постижение демонстрира високото ниво на програмиране и алгоритмично мислене, преподавани в нашето училище.</p><p>В състезанието участваха представители от 45 държави, което прави това постижение още по-значимо. Иновативният подход на Петър към оптимизацията на алгоритми впечатли съдиите и осигури мястото му сред най-добрите участници.</p>',
    date: '2023-04-10',
    student_name: 'Petar Georgiev',
    category: 'Informatics Competition',
    image: '/images/achievements/informatics-award.jpg',
    published: true
  },
  {
    title_en: 'School of Excellence Award 2023',
    title_bg: 'Награда Училище с високи постижения 2023',
    description_en: '<p>A&B School received the School of Excellence Award 2023 for outstanding academic results and innovative teaching methods. This award recognizes our commitment to providing top-quality education.</p><p>The award committee particularly noted our integrated approach to STEM education and our success in national and international competitions across multiple subject areas.</p>',
    description_bg: '<p>Училище А&Б получи наградата Училище с високи постижения 2023 за изключителни академични резултати и иновативни методи на преподаване. Тази награда отличава нашия ангажимент да предоставяме висококачествено образование.</p><p>Комисията по награждаване отбеляза специално нашия интегриран подход към STEM образованието и нашите успехи в национални и международни състезания в множество предметни области.</p>',
    date: '2023-02-28',
    category: 'School Award',
    image: '/images/achievements/school-award.jpg',
    published: true
  }
];

// Seeds the database with sample data
async function seedDatabase() {
  console.log('Starting database seeding...');

  try {
    // Insert news items
    console.log('Seeding news items...');
    const { data: newsData, error: newsError } = await supabase
      .from('news')
      .insert(newsItems)
      .select();

    if (newsError) {
      throw newsError;
    }
    console.log(`Successfully inserted ${newsData.length} news items`);

    // Insert achievements
    console.log('Seeding achievements...');
    const { data: achievementsData, error: achievementsError } = await supabase
      .from('achievements')
      .insert(achievements)
      .select();

    if (achievementsError) {
      throw achievementsError;
    }
    console.log(`Successfully inserted ${achievementsData.length} achievements`);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedDatabase(); 