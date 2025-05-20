import { Locale, locales } from '@/lib/i18n';
import { Metadata } from 'next';
import Link from 'next/link';
import { getAllNews } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import ImageWithFallback from '@/components/ui/image-with-fallback';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface NewsPageProps {
  params: {
    locale: Locale;
  };
  searchParams: {
    page?: string;
  };
}

// Number of items per page
const PAGE_SIZE = 9;

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

export default async function NewsPage({ params, searchParams }: NewsPageProps) {
  const { locale } = params;
  // Get the current page from query params (default to 1)
  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1;
  
  // Fetch news with pagination
  const { data: newsItems, count: totalCount, error } = await getAllNews(currentPage, PAGE_SIZE);
  
  // Calculate pagination details
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;
  
  // Error component
  if (error) {
    return (
      <main className="py-10">
        <div className="container">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {locale === 'en' ? 'Error' : 'Грешка'}
            </AlertTitle>
            <AlertDescription>
              {locale === 'en' 
                ? 'There was an error loading the news. Please try again later.' 
                : 'Възникна грешка при зареждането на новините. Моля, опитайте отново по-късно.'}
            </AlertDescription>
          </Alert>
        </div>
      </main>
    );
  }
  
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
        
        {/* No news items found message */}
        {newsItems.length === 0 && (
          <div className="text-center p-8">
            <p className="text-muted-foreground text-lg">
              {locale === 'en'
                ? 'No news articles found at the moment.'
                : 'В момента няма налични новини.'}
            </p>
          </div>
        )}
        
        {/* News grid */}
        {newsItems.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {newsItems.map((item) => {
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
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <Button 
              variant="outline" 
              disabled={!hasPreviousPage}
              asChild={hasPreviousPage}
            >
              {hasPreviousPage ? (
                <Link href={`/${locale}/news?page=${currentPage - 1}`}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  {locale === 'en' ? 'Previous' : 'Предишна'}
                </Link>
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  {locale === 'en' ? 'Previous' : 'Предишна'}
                </>
              )}
            </Button>
            
            <span className="text-sm">
              {locale === 'en' 
                ? `Page ${currentPage} of ${totalPages}` 
                : `Страница ${currentPage} от ${totalPages}`}
            </span>
            
            <Button 
              variant="outline" 
              disabled={!hasNextPage}
              asChild={hasNextPage}
            >
              {hasNextPage ? (
                <Link href={`/${locale}/news?page=${currentPage + 1}`}>
                  {locale === 'en' ? 'Next' : 'Следваща'}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              ) : (
                <>
                  {locale === 'en' ? 'Next' : 'Следваща'}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
} 