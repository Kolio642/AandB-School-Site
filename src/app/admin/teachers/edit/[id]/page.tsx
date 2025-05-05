'use client';

import { TeacherForm } from '@/components/admin';

interface EditTeacherPageProps {
  params: {
    id: string;
  };
}

export default function EditTeacherPage({ params }: EditTeacherPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Teacher</h1>
        <p className="text-muted-foreground mt-2">
          Update the teacher's information
        </p>
      </div>
      
      <TeacherForm teacherId={params.id} />
    </div>
  );
} 