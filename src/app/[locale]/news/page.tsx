import { Locale, locales } from '@/lib/i18n';
import { Metadata } from 'next';
import Link from 'next/link';
import { getAllNews } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import ImageWithFallback from '@/components/ui/image-with-fallback';

interface NewsPageProps {
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

export function generateMetadata({ params }: NewsPageProps): Metadata {
  const locale = params.locale;
  return {
    title: locale === 'en' ? 'News - A&B School' : 'Новини - Школа А&Б',
    description: locale === 'en' 
      ? 'Latest news and events from A&B School' 
      : 'Последни новини и събития от Школа А&Б'
  };
}

export default async function NewsPage({ params }: NewsPageProps) {
  const { locale } = params;
  const allNews = await getAllNews();
  
  return (
    <main className="py-10">
      <div className="container">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">
            {locale === 'en' ? 'News' : 'Новини'}
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            {locale === 'en' 
              ? 'Stay updated with the latest events, achievements, and announcements from A&B School' 
              : 'Бъдете в крак с най-новите събития, постижения и съобщения от Школа А&Б'}
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {allNews.map((item) => {
            // Skip rendering if the item is undefined
            if (!item) return null;
            
            // Make sure translations exist and have a fallback if not
            const translation = item.translations?.[locale] || {
              title: locale === 'en' ? 'Untitled' : 'Без заглавие',
              summary: locale === 'en' ? 'No summary available' : 'Няма налично резюме',
              content: ''
            };
            
            // Format date with a fallback
            const formattedDate = item.date 
              ? formatDate(new Date(item.date), locale === 'en' ? 'en-US' : 'bg-BG')
              : locale === 'en' ? 'Unknown date' : 'Неизвестна дата';
            
            return (
              <div key={item.id} className="flex flex-col overflow-hidden rounded-lg shadow-md bg-card">
                <div className="relative h-48 w-full" style={{position: 'relative'}}>
                  <ImageWithFallback 
                    src={item.image || '/placeholder.jpg'}
                    alt={translation.title || ''}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                  />
                </div>
                <div className="flex flex-col gap-2 p-6">
                  <p className="text-sm text-muted-foreground">{formattedDate}</p>
                  <h2 className="text-xl font-semibold line-clamp-2">{translation.title}</h2>
                  <p className="mt-2 text-muted-foreground line-clamp-3">{translation.summary}</p>
                  <div className="mt-4">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/${locale}/news/${item.id}`}>
                        {locale === 'en' ? 'Read More' : 'Прочетете повече'}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
} 