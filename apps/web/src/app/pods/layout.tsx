import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Explore Sleep Pods | Book Premium Pods Near You - Naploo",
  description: "Browse and book premium sleep pods across India.",
  keywords: "book sleep pod, pod near me, sleep pod booking",
  openGraph: {
    title: "Explore Sleep Pods | Book Premium Pods Near You - Naploo",
    description: "Browse and book premium sleep pods across India.",
    url: "https://naploo.com/pods",
    siteName: "Naploo",
    type: "website",
  },
  alternates: { canonical: "https://naploo.com/pods" },

};

export default function PodsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
