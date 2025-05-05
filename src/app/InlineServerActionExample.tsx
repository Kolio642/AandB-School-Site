'use client';

import { useTransition, useState } from 'react';

// This is a client component that will call a server action
export default function InlineServerActionExample() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  // This server action needs to be defined separately
  async function subscribeAction(formData: FormData) {
    'use server';
    
    const email = formData.get('email')?.toString();
    
    if (!email) {
      return { error: 'Email is required' };
    }
    
    try {
      // Here you would add the email to a newsletter service
      console.log('Subscribed email:', email);
      return { success: true };
    } catch (error) {
      console.error('Error subscribing:', error);
      return { error: 'Failed to subscribe' };
    }
  }

  // Client-side handler to process the server action result
  const handleSubmit = async (formData: FormData) => {
    setMessage(null);
    startTransition(async () => {
      const result = await subscribeAction(formData);
      if ('error' in result && result.error) {
        setMessage(result.error);
      } else if ('success' in result) {
        setMessage('Subscribed successfully!');
        (document.getElementById('subscribe-form') as HTMLFormElement).reset();
      }
    });
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Quick Subscribe</h2>
      
      {message && (
        <div className={`p-3 mb-4 rounded ${message.includes('error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
      
      <form 
        id="subscribe-form"
        action={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75"
        >
          {isPending ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
    </div>
  );
} 