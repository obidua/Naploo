import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "FAQs | Naploo Sleep Pods - Common Questions Answered",
  description: "Find answers to frequently asked questions about Naploo sleep pods.",
  keywords: "naploo faq, sleep pod questions, pod hotel faq",
  openGraph: {
    title: "FAQs | Naploo Sleep Pods - Common Questions Answered",
    description: "Find answers to frequently asked questions about Naploo sleep pods.",
    url: "https://naploo.com/faqs",
    siteName: "Naploo",
    type: "website",
  },
  alternates: { canonical: "https://naploo.com/faqs" },

};

export default function FaqsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
