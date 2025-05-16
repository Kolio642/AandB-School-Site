import { Locale, locales } from '@/lib/i18n';
import { Metadata } from 'next';
import Link from 'next/link';
import { getNewsById, getAllNews } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { notFound } from 'next/navigation';
import ImageWithFallback from '@/components/ui/image-with-fallback';

interface NewsDetailPageProps {
  params: {
    locale: Locale;
    id: string;
  };
}

// This function is required when using static export with dynamic routes
export async function generateStaticParams() {
  const news = await getAllNews();
  
  // Generate all combinations of locale and news id
  const params = [];
  
  for (const locale of locales) {
    for (const newsItem of news) {
      if (newsItem) {
        params.push({
          locale,
          id: newsItem.id
        });
      }
    }
  }
  
  return params;
}

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  const { locale, id } = params;
  const newsItem = await getNewsById(id);
  
  if (!newsItem) {
    return {
      title: locale === 'en' ? 'News Not Found' : 'Новина не е намерена',
    };
  }
  
  // Make sure translation exists, provide fallbacks if not
  const translation = newsItem.translations?.[locale] || {
    title: locale === 'en' ? 'Untitled' : 'Без заглавие',
    summary: locale === 'en' ? 'No summary available' : 'Няма налично резюме',
    content: ''
  };
  
  return {
    title: translation.title,
    description: translation.summary
  };
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { locale, id } = params;
  const newsItem = await getNewsById(id);
  
  if (!newsItem) {
    notFound();
  }
  
  // Make sure translation exists, provide fallbacks if not
  const translation = newsItem.translations?.[locale] || {
    title: locale === 'en' ? 'Untitled' : 'Без заглавие',
    summary: locale === 'en' ? 'No summary available' : 'Няма налично резюме',
    content: ''
  };
  
  // Format date with a fallback
  const formattedDate = newsItem.date 
    ? formatDate(new Date(newsItem.date), locale === 'en' ? 'en-US' : 'bg-BG')
    : locale === 'en' ? 'Unknown date' : 'Неизвестна дата';
  
  return (
    <main className="py-10">
      <div className="container">
        <Button asChild variant="ghost" className="mb-6">
          <Link href={`/${locale}/news`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {locale === 'en' ? 'Back to News' : 'Обратно към новините'}
          </Link>
        </Button>
        
        <article className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {translation.title}
          </h1>
          
          <p className="text-muted-foreground mb-6">
            {formattedDate}
          </p>
          
          {newsItem.image && (
            <div className="relative h-[300px] md:h-[400px] mb-8 rounded-lg overflow-hidden" style={{position: 'relative'}}>
              <ImageWithFallback 
                src={newsItem.image}
                alt={translation.title || ''}
                fill
                className="object-cover"
              />
            </div>
          )}
          
          <div 
            className="prose prose-lg max-w-none dark:prose-invert" 
            dangerouslySetInnerHTML={{ __html: translation.content }}
          />
        </article>
      </div>
    </main>
  );
} 