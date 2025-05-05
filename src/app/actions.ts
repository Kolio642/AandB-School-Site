'use server';

import { revalidatePath } from 'next/cache';

export async function submitContactForm(formData: FormData) {
  const name = formData.get('name')?.toString();
  const email = formData.get('email')?.toString();
  const message = formData.get('message')?.toString();

  // Handle validation
  if (!name || !email || !message) {
    return { error: 'All fields are required' };
  }

  try {
    // Here you would typically send this data to a database or email service
    console.log('Form submitted:', { name, email, message });
    
    // Revalidate the path to update the UI
    revalidatePath('/contacts');
    
    return { success: true };
  } catch (error) {
    console.error('Error submitting form:', error);
    return { error: 'Failed to submit form' };
  }
} 