import type { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export default function PartnerPortalLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
