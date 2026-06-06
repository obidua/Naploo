import { Suspense } from 'react';
import SearchPageClient from './SearchPageClient';

export const dynamic = 'force-dynamic';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center text-slate-500">Loading…</div>}>
      <SearchPageClient />
    </Suspense>
  );
}
