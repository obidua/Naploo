import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Naploo Blog | Travel Tips, Pod News & Sleep Science",
  description: "Explore the Naploo blog for travel tips, sleep science articles, pod technology updates.",
  keywords: "naploo blog, travel blog India, sleep tips, pod hotel news",
  openGraph: {
    title: "Naploo Blog | Travel Tips, Pod News & Sleep Science",
    description: "Explore the Naploo blog for travel tips, sleep science articles, pod technology updates.",
    url: "https://naploo.com/blog",
    siteName: "Naploo",
    type: "website",
  },
  alternates: { canonical: "https://naploo.com/blog" },

};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
