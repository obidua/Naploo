import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-gradient-to-br from-primary-50 via-white to-violet-50">
      <div className="text-7xl md:text-9xl font-display font-bold gradient-text">404</div>
      <h1 className="mt-4 text-2xl md:text-3xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-600 max-w-md">
        The page you're looking for has either moved, never existed, or is taking a nap.
      </p>
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold shadow-md hover:shadow-lg"
        >
          Go home
        </Link>
        <Link
          href="/search"
          className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-slate-800 font-medium hover:border-primary-300"
        >
          Find a stay
        </Link>
      </div>
    </main>
  );
}
