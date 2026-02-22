import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Naploo Pricing | Sleep Pods Starting ₹99/Hour",
  description: "Affordable sleep pod pricing. Standard pods from ₹99/hr.",
  keywords: "naploo pricing, sleep pod rates, pod hotel price",
  openGraph: {
    title: "Naploo Pricing | Sleep Pods Starting ₹99/Hour",
    description: "Affordable sleep pod pricing. Standard pods from ₹99/hr.",
    url: "https://naploo.com/pricing",
    siteName: "Naploo",
    type: "website",
  },
  alternates: { canonical: "https://naploo.com/pricing" },

};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
