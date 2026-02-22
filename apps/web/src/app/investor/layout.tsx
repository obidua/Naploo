import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Buy Naploo Pods | Invest in Sleep Pods - Earn 25-40% ROI",
  description: "Invest in Naploo sleep pods. Own premium pods at high-traffic locations.",
  keywords: "buy sleep pods, invest in pods, pod investment India",
  openGraph: {
    title: "Buy Naploo Pods | Invest in Sleep Pods - Earn 25-40% ROI",
    description: "Invest in Naploo sleep pods. Own premium pods at high-traffic locations.",
    url: "https://naploo.com/investor",
    siteName: "Naploo",
    type: "website",
  },
  alternates: { canonical: "https://naploo.com/investor" },

};

export default function InvestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
