// Script to seed Supabase with initial data
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Supabase credentials not found in .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: fetch
  }
});

// Sample news data
const newsItems = [
  {
    title_en: 'New Computer Lab Opens at A&B School',
    title_bg: 'Нова компютърна лаборатория открита в Школа А&Б',
    summary_en: 'State-of-the-art computer lab with 20 workstations opens to enhance student learning.',
    summary_bg: 'Съвременна компютърна лаборатория с 20 работни станции отваря врати.',
    content_en: '<p>We are excited to announce the opening of our new state-of-the-art computer lab!</p><p>The facility is equipped with 20 high-performance workstations, interactive displays, and the latest software tools for programming and design.</p>',
    content_bg: '<p>С радост обявяваме откриването на нашата нова съвременна компютърна лаборатория!</p><p>Съоръжението е оборудвано с 20 високопроизводителни работни станции, интерактивни дисплеи и най-новите софтуерни инструменти за програмиране и дизайн.</p>',
    date: '2023-09-15',
    image: '/images/news/computer-lab.jpg',
    published: true
  },
  {
    title_en: 'A&B School Students Win Regional Math Competition',
    title_bg: 'Ученици от Школа А&Б печелят регионално състезание по математика',
    summary_en: 'Our students brought home three gold medals and two silver medals.',
    summary_bg: 'Нашите ученици донесоха три златни медала и два сребърни медала.',
    content_en: '<p>We are proud to announce that A&B School students have achieved outstanding results at the Regional Mathematics Competition held last weekend.</p><p>Our team of 10 students participated in various age categories, bringing home a total of 5 medals.</p>',
    content_bg: '<p>С гордост обявяваме, че учениците от Школа А&Б постигнаха изключителни резултати на Регионалното състезание по математика, проведено миналия уикенд.</p><p>Нашият отбор от 10 ученици участва в различни възрастови категории, донасяйки общо 5 медала.</p>',
    date: '2023-10-20',
    image: '/images/news/math-competition.jpg',
    published: true
  }
];

// Sample achievements data
const achievements = [
  {
    title_en: 'First Place in National Mathematics Olympiad',
    title_bg: 'Първо място на Национална олимпиада по математика',
    description_en: '<p>Our student Maria Ivanova won first place in the National Mathematics Olympiad for high school students.</p>',
    description_bg: '<p>Нашата ученичка Мария Иванова спечели първо място на Националната олимпиада по математика за гимназисти.</p>',
    date: '2023-05-15',
    student_name: 'Maria Ivanova',
    category: 'Math Competition',
    image: '/images/achievements/math-olympiad.jpg',
    published: true
  },
  {
    title_en: 'Bronze Medal at International Informatics Competition',
    title_bg: 'Бронзов медал на Международно състезание по информатика',
    description_en: '<p>Our student Petar Georgiev won a bronze medal at the International Informatics Competition.</p>',
    description_bg: '<p>Нашият ученик Петър Георгиев спечели бронзов медал на Международното състезание по информатика.</p>',
    date: '2023-04-10',
    student_name: 'Petar Georgiev',
    category: 'Informatics Competition',
    image: '/images/achievements/informatics-award.jpg',
    published: true
  }
];

async function seedDatabase() {
  try {
    console.log('Seeding news table...');
    
    // Insert news items
    const { data: newsData, error: newsError } = await supabase
      .from('news')
      .insert(newsItems)
      .select();
      
    if (newsError) {
      console.error('Error inserting news:', newsError);
    } else {
      console.log(`Successfully inserted ${newsData.length} news items!`);
    }
    
    console.log('Seeding achievements table...');
    
    // Insert achievements
    const { data: achievementsData, error: achievementsError } = await supabase
      .from('achievements')
      .insert(achievements)
      .select();
      
    if (achievementsError) {
      console.error('Error inserting achievements:', achievementsError);
    } else {
      console.log(`Successfully inserted ${achievementsData.length} achievements!`);
    }
    
    console.log('Database seeding completed!');
  } catch (error) {
    console.error('Unexpected error during seeding:', error);
  }
}

// Run the seeding function
seedDatabase(); 