import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Contact Naploo | Customer Support & Inquiries",
  description: "Get in touch with Naploo. 24/7 customer support. Partnership inquiries, feedback & support.",
  keywords: "contact naploo, naploo support, naploo customer care",
  openGraph: {
    title: "Contact Naploo | Customer Support & Inquiries",
    description: "Get in touch with Naploo. 24/7 customer support. Partnership inquiries, feedback & support.",
    url: "https://naploo.com/contact",
    siteName: "Naploo",
    type: "website",
  },
  alternates: { canonical: "https://naploo.com/contact" },

};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
