import { Locale, locales } from '@/lib/i18n';
import { Metadata } from 'next';
import { MapPin, Phone, Mail, Clock, AlertCircle } from 'lucide-react';
import { OpenStreetMap } from '@/components/open-street-map';

interface ContactsPageProps {
  params: {
    locale: Locale;
  };
}

// This function is required when using static export with dynamic routes
export function generateStaticParams() {
  return locales.map((locale) => ({
    locale,
  }));
}

export function generateMetadata({ params }: ContactsPageProps): Metadata {
  const locale = params.locale;
  return {
    title: locale === 'en' ? 'Contacts - A&B School' : 'Контакти - Школа А&Б',
    description: locale === 'en' 
      ? 'Contact information for A&B School - address, phone number, email, and office hours' 
      : 'Информация за контакт с Школа А&Б - адрес, телефон, имейл и работно време'
  };
}

export default function ContactsPage({ params }: ContactsPageProps) {
  const { locale } = params;
  
  // School address based on locale
  const schoolAddress = locale === 'en'
    ? '13 Hristo Botev St. (kazandzhiyska), Shumen 9700, Bulgaria'
    : 'ул. "Христо Ботев" №13 (казанджийска), гр. Шумен 9700, България';
  
  // School coordinates (Shumen, Bulgaria)
  const schoolCoordinates = {
    latitude: 43.270241,
    longitude: 26.923351
  };
  
  return (
    <main className="py-16">
      <div className="container">
        {/* Page Title */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {locale === 'en' ? 'Contact Us' : 'Свържете се с нас'}
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {locale === 'en' 
              ? 'Have questions about our programs or want to enroll your child? We\'d love to hear from you!' 
              : 'Имате въпроси относно нашите програми или искате да запишете детето си? Ще се радваме да се свържете с нас!'}
          </p>
        </div>
        
        {/* Contact Information and Map */}
        <div className="grid gap-10 md:grid-cols-2 lg:gap-16 items-start">
          {/* Contact Information */}
          <div className="p-8 rounded-2xl shadow-lg bg-background border border-muted">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-xl mb-2">
                    {locale === 'en' ? 'Address' : 'Адрес'}
                  </h2>
                  <address className="not-italic text-muted-foreground">
                    {schoolAddress}
                  </address>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-xl mb-2">
                    {locale === 'en' ? 'Phone' : 'Телефон'}
                  </h2>
                  <p className="text-muted-foreground">
                    <a 
                      href="tel:+35954831008" 
                      className="hover:text-primary transition-colors"
                    >
                      +359 54 831 008
                    </a>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-xl mb-2">
                    {locale === 'en' ? 'Email' : 'Имейл'}
                  </h2>
                  <p className="text-muted-foreground">
                    <a 
                      href="mailto:info@abschool.bg" 
                      className="hover:text-primary transition-colors"
                    >
                      info@abschool.bg
                    </a>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-xl mb-2">
                    {locale === 'en' ? 'Office Hours' : 'Работно време'}
                  </h2>
                  <div className="text-muted-foreground space-y-1">
                    <p>
                      <span className="font-medium">
                        {locale === 'en' ? 'Monday - Friday:' : 'Понеделник - Петък:'}
                      </span> {' '}
                      {locale === 'en' ? '9:00 AM - 6:00 PM' : '9:00 - 18:00'}
                    </p>
                    <p>
                      <span className="font-medium">
                        {locale === 'en' ? 'Saturday:' : 'Събота:'}
                      </span> {' '}
                      {locale === 'en' ? '9:00 AM - 1:00 PM' : '9:00 - 13:00'}
                    </p>
                    <p>
                      <span className="font-medium">
                        {locale === 'en' ? 'Sunday:' : 'Неделя:'}
                      </span> {' '}
                      {locale === 'en' ? 'Closed' : 'Затворено'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* OpenStreetMap */}
          <div className="h-[500px] rounded-2xl overflow-hidden shadow-lg">
            <OpenStreetMap 
              latitude={schoolCoordinates.latitude}
              longitude={schoolCoordinates.longitude}
              height="100%"
              zoom={16}
              markerTitle={locale === 'en' ? 'A&B School' : 'Школа A&B'}
            />
          </div>
        </div>
        
        {/* Contact Form Section */}
        <div className="max-w-2xl mx-auto mt-16 p-8 rounded-2xl shadow-lg bg-background border border-muted">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {locale === 'en' ? 'Send Us a Message' : 'Изпратете ни съобщение'}
          </h2>
          
          <form className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  {locale === 'en' ? 'Name' : 'Име'}
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm"
                  placeholder={locale === 'en' ? 'Your name' : 'Вашето име'}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  {locale === 'en' ? 'Email' : 'Имейл'}
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm"
                  placeholder={locale === 'en' ? 'Your email' : 'Вашият имейл'}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-2">
                {locale === 'en' ? 'Subject' : 'Тема'}
              </label>
              <input
                type="text"
                id="subject"
                className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm"
                placeholder={locale === 'en' ? 'Subject of your message' : 'Тема на вашето съобщение'}
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                {locale === 'en' ? 'Message' : 'Съобщение'}
              </label>
              <textarea
                id="message"
                rows={5}
                className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm resize-none"
                placeholder={locale === 'en' ? 'Your message' : 'Вашето съобщение'}
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground rounded-md px-4 py-3 font-medium hover:bg-primary/90 transition-colors"
            >
              {locale === 'en' ? 'Send Message' : 'Изпратете съобщение'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
} 