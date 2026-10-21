'use client';

import { use, Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import BrandLogo from '@/components/BrandLogo';
import EventDetailsView from '@/components/EventDetailsView';

interface PageProps {
  params: Promise<{ id: string }>;
}

function PublicEventContent({ params }: PageProps) {
  const resolvedParams = use(params);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      {/* Public Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <BrandLogo size="md" />
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight text-gray-900 leading-none">
                GMT
              </span>
              <span className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase mt-1">
                Grassroots Movement
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold text-gray-600">
            <Link href="/" className="hover:text-emerald-600 transition-colors">
              Home
            </Link>
            <Link href="/#events" className="text-emerald-600 font-bold">
              Events &amp; Summits
            </Link>
            <Link href="/#empowerments" className="hover:text-emerald-600 transition-colors">
              Empowerment
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            {user ? (
              <Link
                href="/dashboard/events"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all"
              >
                Member Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-emerald-600 font-bold text-xs px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all"
                >
                  Join GMT
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        <EventDetailsView eventId={resolvedParams.id} mode="public" />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 border-t border-gray-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Grassroots Mobilization Team (GMT). All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/#events" className="hover:text-white transition-colors">
              Events
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Member Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function PublicEventPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <PublicEventContent {...props} />
    </Suspense>
  );
}
