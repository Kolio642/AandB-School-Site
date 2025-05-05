import { Locale, locales } from '@/lib/i18n';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

// Dynamically import the OpenStreetMap component to improve page load performance
const OpenStreetMap = dynamic(
  () => import('@/components/open-street-map').then(mod => mod.OpenStreetMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-gray-100 rounded-2xl animate-pulse">
        <div className="text-center">
          <div className="rounded-full h-12 w-12 bg-primary/30 animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    ),
  }
);

// Dynamically import the contact form component to avoid TypeScript issues
const ContactForm = dynamic(() => import('@/app/[locale]/contacts/contact-form'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse space-y-4">
      <div className="h-10 bg-gray-200 rounded w-full"></div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
      <div className="h-32 bg-gray-200 rounded w-full"></div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
    </div>
  )
});

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
    latitude: 43.27085906930125,
    longitude: 26.91861753015853
  };
  
  return (
    <main className="py-8 md:py-16">
      <div className="container px-4 md:px-6">
        {/* Page Title with decorative elements */}
        <div className="max-w-4xl mx-auto text-center mb-8 md:mb-12 relative">
          {/* Decorative circles */}
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-primary/5 rounded-full hidden md:block" aria-hidden="true"></div>
          <div className="absolute -bottom-8 -right-10 w-16 h-16 bg-purple-500/5 rounded-full hidden md:block" aria-hidden="true"></div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {locale === 'en' ? 'Contact Us' : 'Свържете се с нас'}
          </h1>
          
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {locale === 'en' 
              ? 'Have questions about our programs or want to enroll your child? We\'d love to hear from you!' 
              : 'Имате въпроси относно нашите програми или искате да запишете детето си? Ще се радваме да се свържете с нас!'}
          </p>
          
          {/* Decorative line */}
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-600 mx-auto mt-6 rounded-full"></div>
        </div>
        
        {/* Contact Information and Map */}
        <div className="grid gap-6 md:gap-10 lg:gap-16 md:grid-cols-2 items-start">
          {/* Contact Information */}
          <div className="p-6 md:p-8 rounded-2xl shadow-lg bg-background border border-muted relative overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" aria-hidden="true"></div>
            
            <div className="space-y-6 md:space-y-8 relative z-10">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10 text-primary flex-shrink-0">
                  <MapPin className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg md:text-xl mb-1 md:mb-2">
                    {locale === 'en' ? 'Address' : 'Адрес'}
                  </h2>
                  <address className="not-italic text-muted-foreground text-sm md:text-base">
                    {schoolAddress}
                  </address>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10 text-primary flex-shrink-0">
                  <Phone className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg md:text-xl mb-1 md:mb-2">
                    {locale === 'en' ? 'Phone' : 'Телефон'}
                  </h2>
                  <p className="text-muted-foreground text-sm md:text-base">
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
                <div className="p-3 rounded-full bg-primary/10 text-primary flex-shrink-0">
                  <Mail className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg md:text-xl mb-1 md:mb-2">
                    {locale === 'en' ? 'Email' : 'Имейл'}
                  </h2>
                  <p className="text-muted-foreground text-sm md:text-base">
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
                <div className="p-3 rounded-full bg-primary/10 text-primary flex-shrink-0">
                  <Clock className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg md:text-xl mb-1 md:mb-2">
                    {locale === 'en' ? 'Office Hours' : 'Работно време'}
                  </h2>
                  <div className="text-muted-foreground text-sm md:text-base space-y-1">
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
          <div className="h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-lg border border-muted">
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
        <div className="max-w-2xl mx-auto mt-10 md:mt-16 p-6 md:p-8 rounded-2xl shadow-lg bg-background border border-muted relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-primary/5 rotate-45 hidden md:block" aria-hidden="true"></div>
          <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-purple-500/5 rotate-12 hidden md:block" aria-hidden="true"></div>
          
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">
            {locale === 'en' ? 'Send Us a Message' : 'Изпратете ни съобщение'}
          </h2>
          
          <ContactForm locale={locale} />
        </div>
      </div>
    </main>
  );
} 