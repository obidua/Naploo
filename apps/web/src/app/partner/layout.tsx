import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Partner With Naploo | Earn ₹50,000+/Month with Sleep Pods",
  description: "Join Naploo partner network. Install sleep pods at your property.",
  keywords: "naploo partner, sleep pod franchise, pod hotel business",
  openGraph: {
    title: "Partner With Naploo | Earn ₹50,000+/Month with Sleep Pods",
    description: "Join Naploo partner network. Install sleep pods at your property.",
    url: "https://naploo.com/partner",
    siteName: "Naploo",
    type: "website",
  },
  alternates: { canonical: "https://naploo.com/partner" },

};

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
