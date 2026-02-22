import type { Metadata } from 'next';

const baseUrl = 'https://naploo.com';
const siteName = 'Naploo';
const defaultImage = 'https://naploo.com/Pods_Images/For%20Website%20main%20images/Main%20Pods%20Image.png';

type OpenGraphType = 'website' | 'article' | 'book' | 'profile';

export function generateMetadata(
  title: string,
  description: string,
  keywords: string,
  path: string = '',
  options: { noIndex?: boolean; ogType?: OpenGraphType } = {}
): Metadata {
  const url = path ? `${baseUrl}${path}` : baseUrl;
  
  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url,
      siteName,
      type: options.ogType || 'website',
      locale: 'en_IN',
      images: [{ url: defaultImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [defaultImage],
      creator: '@naploo',
    },
    robots: options.noIndex ? { index: false, follow: true } : { index: true, follow: true },
    alternates: { canonical: url },
  };
}
