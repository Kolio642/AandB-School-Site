#!/usr/bin/env node

/**
 * Seed Database Script
 * 
 * This script populates the Supabase database with mock data for:
 * - News
 * - Achievements
 * - Teachers
 * - Courses
 * 
 * It uses the placeholders from these services for images:
 * - https://picsum.photos/ - Random beautiful images
 * - https://randomuser.me/ - Random user profile pictures (for teachers)
 * 
 * Usage:
 * 1. Make sure your .env file contains proper Supabase credentials
 * 2. Run: node scripts/seed-db.js
 */

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
const { faker } = require('@faker-js/faker');
const path = require('path');

// Load environment variables from project root .env.local file
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Service Role Key available:', !!supabaseServiceKey);

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper function to generate a random date in the past 2 years
function randomPastDate(months = 24) {
  const today = new Date();
  const pastDate = new Date(today);
  pastDate.setMonth(today.getMonth() - Math.floor(Math.random() * months));
  pastDate.setDate(Math.floor(Math.random() * 28) + 1); // Random day 1-28
  return pastDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
}

// Helper function to generate an ISO date string with timestamp
function getCurrentTimestamp() {
  return new Date().toISOString();
}

// Helper to generate a random image URL from picsum.photos
function randomImageUrl(width = 800, height = 600) {
  // Add a random ID to make each URL unique
  const randomId = Math.floor(Math.random() * 1000);
  return `https://picsum.photos/id/${randomId}/${width}/${height}`;
}

// Helper to generate a random teacher profile image
function randomTeacherImageUrl() {
  // Generate a random gender for more realistic teacher images
  const gender = Math.random() > 0.5 ? 'men' : 'women';
  // Random ID for the image
  const randomId = Math.floor(Math.random() * 80) + 1;
  return `https://randomuser.me/api/portraits/${gender}/${randomId}.jpg`;
}

// Seed the News table
async function seedNewsTable(count = 10) {
  console.log(`Seeding News table with ${count} entries...`);
  
  const newsEntries = [];
  
  for (let i = 0; i < count; i++) {
    // Create a news entry with Bulgarian and English content
    const title_en = faker.lorem.sentence(4, 8);
    const title_bg = `[БГ] ${title_en}`; // Simplified - would be real Bulgarian in production
    
    newsEntries.push({
      id: uuidv4(),
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp(),
      title_en,
      title_bg,
      summary_en: faker.lorem.paragraph(2),
      summary_bg: `[БГ] ${faker.lorem.paragraph(2)}`,
      content_en: faker.lorem.paragraphs(3),
      content_bg: `[БГ] ${faker.lorem.paragraphs(3)}`,
      date: randomPastDate(),
      image: randomImageUrl(),
      published: Math.random() > 0.2 // 80% are published
    });
  }
  
  // Insert the news entries into the database
  const { data, error } = await supabase
    .from('news')
    .insert(newsEntries);
    
  if (error) {
    console.error('Error seeding news table:', error);
    return false;
  }
  
  console.log(`✅ Successfully added ${count} news entries`);
  return true;
}

// Seed the Achievements table
async function seedAchievementsTable(count = 15) {
  console.log(`Seeding Achievements table with ${count} entries...`);
  
  // Achievement categories
  const categories = [
    'academic', 
    'sports', 
    'arts', 
    'science', 
    'math', 
    'language', 
    'community'
  ];
  
  const achievements = [];
  
  for (let i = 0; i < count; i++) {
    // Create student name - in some cases null (school achievement, not student)
    const hasStudentName = Math.random() > 0.3;
    const studentName = hasStudentName
      ? `${faker.name.firstName()} ${faker.name.lastName()}`
      : null;
      
    // Randomize category
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    // Create an achievement with Bulgarian and English content
    const title_en = faker.lorem.sentence(3, 7);
    
    achievements.push({
      id: uuidv4(),
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp(),
      title_en,
      title_bg: `[БГ] ${title_en}`,
      description_en: faker.lorem.paragraph(),
      description_bg: `[БГ] ${faker.lorem.paragraph()}`,
      date: randomPastDate(36), // Past 3 years
      image: randomImageUrl(600, 400),
      student_name: studentName,
      category,
      published: Math.random() > 0.1 // 90% are published
    });
  }
  
  // Insert the achievements into the database
  const { data, error } = await supabase
    .from('achievements')
    .insert(achievements);
    
  if (error) {
    console.error('Error seeding achievements table:', error);
    return false;
  }
  
  console.log(`✅ Successfully added ${count} achievement entries`);
  return true;
}

// Seed the Teachers table
async function seedTeachersTable(count = 12) {
  console.log(`Seeding Teachers table with ${count} entries...`);
  
  const teachers = [];
  
  for (let i = 0; i < count; i++) {
    // Generate teacher data
    const name = `${faker.name.firstName()} ${faker.name.lastName()}`;
    const title_en = faker.name.jobTitle();
    
    teachers.push({
      id: uuidv4(),
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp(),
      name,
      title_en,
      title_bg: `[БГ] ${title_en}`,
      bio_en: faker.lorem.paragraphs(2),
      bio_bg: `[БГ] ${faker.lorem.paragraphs(2)}`,
      image: randomTeacherImageUrl(),
      email: faker.internet.email(name.split(' ')[0], name.split(' ')[1], 'aandbs.edu'),
      published: true,
      sort_order: i + 1
    });
  }
  
  // Insert the teachers into the database
  const { data, error } = await supabase
    .from('teachers')
    .insert(teachers);
    
  if (error) {
    console.error('Error seeding teachers table:', error);
    return false;
  }
  
  console.log(`✅ Successfully added ${count} teacher entries`);
  return true;
}

// Seed the Courses table
async function seedCoursesTable(count = 20) {
  console.log(`Seeding Courses table with ${count} entries...`);
  
  // Course categories
  const categories = [
    'language', 
    'science', 
    'math', 
    'arts', 
    'technology', 
    'sports', 
    'humanities'
  ];
  
  const courses = [];
  
  for (let i = 0; i < count; i++) {
    // Randomize category
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    // Create course content
    const title_en = `${faker.company.catchPhraseAdjective()} ${category.charAt(0).toUpperCase() + category.slice(1)}`;
    
    courses.push({
      id: uuidv4(),
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp(),
      title_en,
      title_bg: `[БГ] ${title_en}`,
      description_en: faker.lorem.paragraphs(1),
      description_bg: `[БГ] ${faker.lorem.paragraphs(1)}`,
      image: randomImageUrl(600, 400),
      category,
      published: Math.random() > 0.15, // 85% are published
      sort_order: i + 1
    });
  }
  
  // Insert the courses into the database
  const { data, error } = await supabase
    .from('courses')
    .insert(courses);
    
  if (error) {
    console.error('Error seeding courses table:', error);
    return false;
  }
  
  console.log(`✅ Successfully added ${count} course entries`);
  return true;
}

// Main function to seed all tables
async function seedDatabase() {
  console.log('=== Starting Database Seeding ===');
  console.log('This will populate your database with mock data');
  console.log('Connecting to Supabase...');
  
  // Verify database connection
  const { data, error } = await supabase.from('news').select('count');
  if (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
  console.log('✅ Successfully connected to Supabase');
  
  // Ask for confirmation before proceeding
  console.log('\n⚠️ WARNING: This will add mock data to your database.');
  console.log('Existing data will NOT be deleted, but IDs might conflict.');
  
  // Seed all tables
  console.log('\nBeginning seeding process...');
  
  const results = await Promise.all([
    seedNewsTable(15),
    seedAchievementsTable(20),
    seedTeachersTable(10),
    seedCoursesTable(15)
  ]);
  
  if (results.every(result => result)) {
    console.log('\n✅ Database seeding completed successfully!');
  } else {
    console.log('\n⚠️ Database seeding completed with some errors.');
  }
  
  console.log('\nSeed data uses these placeholder image services:');
  console.log('- News/Achievements/Courses: https://picsum.photos/');
  console.log('- Teacher profile photos: https://randomuser.me/');
  console.log('\nDone!');
}

// Run the seeding function
seedDatabase().catch(err => {
  console.error('Unhandled error during database seeding:', err);
  process.exit(1);
}); 