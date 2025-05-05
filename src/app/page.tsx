import { redirect } from 'next/navigation';

export default function RootPage() {
  // Always redirect to Bulgarian
  redirect('/bg');
} 