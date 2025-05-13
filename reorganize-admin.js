const fs = require('fs');
const path = require('path');

// Directories to create
const directories = [
  'src/components/admin/news',
  'src/components/admin/achievements',
  'src/components/admin/teachers',
  'src/components/admin/courses',
  'src/components/admin/layout',
  'src/components/admin/auth'
];

// Files to move
const filesToMove = [
  { from: 'src/components/admin/news-form.tsx', to: 'src/components/admin/news/news-form.tsx' },
  { from: 'src/components/admin/achievement-form.tsx', to: 'src/components/admin/achievements/achievement-form.tsx' },
  { from: 'src/components/admin/achievement-uploader.tsx', to: 'src/components/admin/achievements/achievement-uploader.tsx' },
  { from: 'src/components/admin/teacher-form.tsx', to: 'src/components/admin/teachers/teacher-form.tsx' },
  { from: 'src/components/admin/course-form.tsx', to: 'src/components/admin/courses/course-form.tsx' },
  { from: 'src/components/admin/dashboard-layout.tsx', to: 'src/components/admin/layout/dashboard-layout.tsx' },
  { from: 'src/components/admin/login-form.tsx', to: 'src/components/admin/auth/login-form.tsx' }
];

// Create directories
for (const dir of directories) {
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    } catch (err) {
      console.error(`Error creating directory ${dir}:`, err);
    }
  }
}

// Move files
for (const file of filesToMove) {
  if (fs.existsSync(file.from)) {
    try {
      const content = fs.readFileSync(file.from, 'utf8');
      fs.writeFileSync(file.to, content);
      console.log(`Moved ${file.from} to ${file.to}`);
      
      // Delete original file after copying
      fs.unlinkSync(file.from);
    } catch (err) {
      console.error(`Error moving file ${file.from}:`, err);
    }
  } else {
    console.log(`Source file not found: ${file.from}`);
  }
}

// Update index.ts
const indexContent = `export { AchievementForm } from './achievements/achievement-form';
export { AchievementUploader } from './achievements/achievement-uploader';
export { LoginForm } from './auth/login-form';
export { NewsForm } from './news/news-form';
export { DashboardLayout } from './layout/dashboard-layout';
export { TeacherForm } from './teachers/teacher-form';
export { CourseForm } from './courses/course-form';
`;

try {
  fs.writeFileSync('src/components/admin/index.ts', indexContent);
  console.log('Updated index.ts');
} catch (err) {
  console.error('Error updating index.ts:', err);
}

console.log('Reorganization complete!'); 