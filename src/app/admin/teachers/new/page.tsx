'use client';

import { TeacherForm } from '@/components/admin';

export default function NewTeacherPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Teacher</h1>
        <p className="text-muted-foreground mt-2">
          Create a new teacher profile for the website.
        </p>
      </div>
      
      <TeacherForm />
    </div>
  );
} 