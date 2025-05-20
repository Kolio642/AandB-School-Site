'use client';

import { useState, FormEvent } from 'react';
import { AlertCircle, Send } from 'lucide-react';
import { Locale } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';

interface ContactFormProps {
  locale: Locale;
}

export default function ContactForm({ locale }: ContactFormProps) {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setSubmitStatus({
        success: false,
        message: locale === 'en' 
          ? 'Please fill in all fields' 
          : 'Моля, попълнете всички полета'
      });
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitStatus({
        success: false,
        message: locale === 'en' 
          ? 'Please enter a valid email address' 
          : 'Моля, въведете валиден имейл адрес'
      });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus({});
    
    try {
      // Create a message with the combined subject and message for the database
      const fullMessage = `Subject: ${formData.subject}\n\n${formData.message}`;
      
      // Insert into Supabase contact_messages table
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name: formData.name,
          email: formData.email,
          message: fullMessage,
          responded: false
        });
      
      if (error) {
        throw error;
      }
      
      // Success
      setSubmitStatus({
        success: true,
        message: locale === 'en' 
          ? 'Message sent successfully! We will get back to you soon.' 
          : 'Съобщението е изпратено успешно! Ще се свържем с вас скоро.'
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error: any) {
      // Error
      console.error('Form submission error:', error);
      
      setSubmitStatus({
        success: false,
        message: locale === 'en' 
          ? 'Failed to send message. Please try again later.' 
          : 'Неуспешно изпращане на съобщението. Моля, опитайте отново по-късно.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      {/* Form submission status message */}
      {submitStatus.message && (
        <div 
          className={`p-4 mb-6 rounded-md flex items-start animate-fadeIn ${
            submitStatus.success 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
          role="alert"
        >
          <div className="flex-shrink-0 pt-0.5">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{submitStatus.message}</p>
          </div>
        </div>
      )}
      
      <form className="space-y-5 md:space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              {locale === 'en' ? 'Name' : 'Име'}
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder={locale === 'en' ? 'Your name' : 'Вашето име'}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              {locale === 'en' ? 'Email' : 'Имейл'}
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder={locale === 'en' ? 'Your email' : 'Вашият имейл'}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="subject" className="block text-sm font-medium">
            {locale === 'en' ? 'Subject' : 'Тема'}
          </label>
          <input
            type="text"
            id="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder={locale === 'en' ? 'Subject of your message' : 'Тема на вашето съобщение'}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="message" className="block text-sm font-medium">
            {locale === 'en' ? 'Message' : 'Съобщение'}
          </label>
          <textarea
            id="message"
            rows={5}
            value={formData.message}
            onChange={handleChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            placeholder={locale === 'en' ? 'Your message' : 'Вашето съобщение'}
          ></textarea>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground rounded-md px-4 py-3 text-sm font-medium transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              <span>{locale === 'en' ? 'Sending...' : 'Изпращане...'}</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>{locale === 'en' ? 'Send Message' : 'Изпратете съобщение'}</span>
            </>
          )}
        </button>
      </form>
    </>
  );
} 