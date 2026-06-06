import { Suspense } from 'react';
import PropertyPageClient from './PropertyPageClient';

export const dynamic = 'force-dynamic';

export default function PropertyPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="pt-32 text-center text-slate-500">Loading…</div>}>
      <PropertyPageClient propertyId={params.id} />
    </Suspense>
  );
}
