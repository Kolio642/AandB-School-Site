import { Locale } from '@/lib/i18n';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getNewsById } from '@/data/news';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { notFound } from 'next/navigation';

interface NewsDetailPageProps {
  params: {
    locale: Locale;
    id: string;
  };
}

export function generateMetadata({ params }: NewsDetailPageProps): Metadata {
  const { locale, id } = params;
  const newsItem = getNewsById(id);
  
  if (!newsItem) {
    return {
      title: locale === 'en' ? 'News Not Found' : 'Новина не е намерена',
    };
  }
  
  const translation = newsItem.translations[locale];
  
  return {
    title: translation.title,
    description: translation.summary
  };
}

export default function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { locale, id } = params;
  const newsItem = getNewsById(id);
  
  if (!newsItem) {
    notFound();
  }
  
  const translation = newsItem.translations[locale];
  const formattedDate = formatDate(new Date(newsItem.date), locale === 'en' ? 'en-US' : 'bg-BG');
  
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
            <div className="relative h-[300px] md:h-[400px] mb-8 rounded-lg overflow-hidden">
              <Image 
                src={newsItem.image}
                alt={translation.title}
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