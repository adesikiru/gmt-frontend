'use client';
// Build trigger: fix-vercel-prerender-v1.0.1

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import {
  GalleryItem,
  defaultGalleryItems,
  extractMediaFromEvents,
  extractYouTubeId,
} from '@/lib/gallery-data';

interface ApiEvent {
  id: string;
  title: string;
  description: string;
  location?: string;
  category?: string;
  startDate: string;
  endDate?: string;
  imageUrl?: string;
  images?: string[];
  videoUrl?: string;
  videos?: string[];
  isPast?: boolean;
  status: string;
  rsvpCount?: number;
}

  const defaultEmpowerments = [
    {
      title: 'Youth Tech & Digital Skills Initiative',
      desc: 'Providing subsidized laptops, coding training, and internet stipends for 2,000 youth across Ogun State wards.',
      icon: '💻',
      stat: '2,000+ Youths Targeted',
    },
    {
      title: 'Market Women & SME Support Grants',
      desc: 'Direct micro-grants and point-of-sale equipment provided to trade cooperatives to expand local businesses.',
      icon: '🏪',
      stat: '₦50M Micro-Fund',
    },
    {
      title: 'Grassroots Agri-Seedling Distribution',
      desc: 'High-yield hybrid seeds, eco-friendly fertilizers, and farming implements distributed to rural farmer clusters.',
      icon: '🌾',
      stat: '20 LGAs Covered',
    },
    {
      title: 'Community Healthcare & Wellness Outreach',
      desc: 'Free hypertension screening, blood sugar checks, and distribution of prescription eyeglasses at ward centres.',
      icon: '🩺',
      stat: '10,000 Beneficiaries',
    },
  ];

  const defaultMediaItems = [
    {
      tag: 'Press Release',
      title: 'GMT Ogun State Digital Grassroots Portal Officially Unveiled',
      date: 'October 2026',
      readTime: '3 min read',
      summary: 'Grassroots Movement for Tinubu activates full digital membership registration across all 20 LGAs and 236 Wards in Ogun State.',
      categoryColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      tag: 'Community News',
      title: 'Youth & Women Empowerment Tour Concludes in Abeokuta',
      date: 'November 2026',
      readTime: '4 min read',
      summary: 'Over 1,200 micro-entrepreneurs received digital tools, vocational equipment, and business startup grants under the GMT umbrella.',
      categoryColor: 'bg-green-50 text-green-700 border-green-200',
    },
    {
      tag: 'Voter Education',
      title: 'Ward-by-Ward Voter Sensitization & Verification Drive',
      date: 'December 2026',
      readTime: '2 min read',
      summary: 'Ensuring all citizens confirm their 20-digit Voter Identification Numbers (VIN) and polling units ahead of upcoming elections.',
      categoryColor: 'bg-teal-50 text-teal-700 border-teal-200',
    },
  ];

export default function Home() {
  const { isLoggedIn, logout, user, loading } = useAuth();

  // Mobile menu
  const [menuOpen, setMenuOpen] = useState(false);

  // Live state
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [empowermentList, setEmpowermentList] = useState(defaultEmpowerments);
  const [newsList, setNewsList] = useState(defaultMediaItems);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(defaultGalleryItems);
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'photo' | 'video'>('all');
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);
  const [activeVideo, setActiveVideo] = useState<GalleryItem | null>(null);

  useEffect(() => {
    // 1. Fetch live events & aggregate media
    api.events.list().then((res) => {
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setEvents(res.data as ApiEvent[]);
        const extracted = extractMediaFromEvents(res.data as ApiEvent[]);
        setGalleryItems(extracted);
      }
    }).catch(() => {}).finally(() => setEventsLoading(false));

    // 2. Fetch live empowerments
    api.empowerments.list().then((res) => {
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const live = (res.data as Array<{ title: string; description: string; icon?: string; statOrBudget?: string }>).map((item) => ({
          title: item.title,
          desc: item.description,
          icon: item.icon || '🤝',
          stat: item.statOrBudget || 'Statewide',
        }));
        setEmpowermentList(live);
      }
    }).catch(() => {});

    // 3. Fetch live news / press releases
    api.news.list().then((res) => {
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const live = (res.data as Array<{ title: string; excerpt?: string; content: string; publishedAt?: string }>).map((item) => ({
          tag: 'Official Press',
          title: item.title,
          date: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' }) : 'October 2026',
          readTime: '3 min read',
          summary: item.excerpt || item.content.slice(0, 140) + '...',
          categoryColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        }));
        setNewsList(live);
      }
    }).catch(() => {});
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans selection:bg-green-100 selection:text-green-800">
      {/* Top Notice Bar */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 text-white text-xs py-2 px-4 text-center font-medium tracking-wide">
        🇳🇬 Grassroots Movement for Tinubu (GMT) — Pilot Phase Active in Ogun State across 20 LGAs &amp; 236 Wards
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-green-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <BrandLogo size="md" showSubtitle={true} href="/" />

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-gray-600">
              <Link href="#about" className="hover:text-emerald-600 transition-colors">About Us</Link>
              <Link href="#events" className="hover:text-emerald-600 transition-colors">Events</Link>
              <Link href="#gallery" className="hover:text-emerald-600 transition-colors">Gallery</Link>
              <Link href="#empowerments" className="hover:text-emerald-600 transition-colors">Empowerment</Link>
              <Link href="#media" className="hover:text-emerald-600 transition-colors">Media &amp; News</Link>
            </div>

            {/* Desktop auth buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {loading ? (
                <div className="w-24 h-9 bg-gray-100 animate-pulse rounded-xl" />
              ) : isLoggedIn ? (
                <>
                  {user?.firstName && (
                    <span className="text-sm font-semibold text-gray-600">
                      Hi, <span className="text-gray-900 font-bold">{user.firstName}</span>
                    </span>
                  )}
                  {user?.isAdmin && (
                    <Link
                      href="/admin"
                      className="text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="text-gray-600 hover:text-red-600 px-3 py-2 text-sm font-semibold transition-colors rounded-lg hover:bg-gray-50"
                  >
                    Sign Out
                  </button>
                  <Link
                    href="/dashboard"
                    className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-sm flex items-center space-x-1.5"
                  >
                    <span>Dashboard</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-emerald-700 hover:text-emerald-800 px-4 py-2 text-sm font-semibold transition-colors">
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-sm"
                  >
                    Join Movement
                  </Link>
                </>
              )}
            </div>

            {/* Mobile: user name + hamburger */}
            <div className="flex md:hidden items-center space-x-3">
              {!loading && isLoggedIn && user?.firstName && (
                <span className="text-xs font-semibold text-gray-700">
                  Hi, <span className="font-bold">{user.firstName}</span>
                </span>
              )}
              <button
                id="mobile-menu-btn"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Toggle menu"
                className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {menuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-5 space-y-1">
              {/* Nav links */}
              {[
                { href: '#about', label: 'About Us' },
                { href: '#events', label: 'Events' },
                { href: '#gallery', label: 'Gallery' },
                { href: '#empowerments', label: 'Empowerment' },
                { href: '#media', label: 'Media & News' },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-semibold text-gray-700 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  {link.label}
                </a>
              ))}

              <div className="pt-3 border-t border-gray-100 mt-3 space-y-2">
                {loading ? (
                  <div className="h-10 bg-gray-100 animate-pulse rounded-xl" />
                ) : isLoggedIn ? (
                  <>
                    {user?.firstName && (
                      <div className="px-4 py-2 text-sm text-gray-500">
                        Signed in as <span className="font-bold text-gray-800">{user.firstName} {user.lastName}</span>
                      </div>
                    )}
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-center space-x-2 w-full bg-emerald-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-emerald-700 transition-colors"
                    >
                      <span>Dashboard</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                    {user?.isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="block w-full text-center bg-emerald-50 text-emerald-800 font-bold py-3 rounded-xl text-sm border border-emerald-200 hover:bg-emerald-100 transition-colors"
                      >
                        Admin Portal
                      </Link>
                    )}
                    <button
                      onClick={() => { setMenuOpen(false); logout(); }}
                      className="w-full text-center py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors border border-red-100"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="block w-full text-center py-3 rounded-xl text-sm font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-50 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMenuOpen(false)}
                      className="block w-full text-center bg-emerald-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      Join the Movement
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-36 bg-gradient-to-b from-emerald-50/60 via-white to-white">
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-200 blur-3xl"></div>
          <div className="absolute top-60 -left-20 w-80 h-80 rounded-full bg-green-100 blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Uniting Grassroots Citizens from Ward to National Level</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-gray-900 leading-[1.1] mb-8">
            Empowering Every Ward.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600">
              Transforming Nigeria.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            The Grassroots Movement for Tinubu (GMT) connects voters, community leaders, and visionaries.
            Starting from Ogun State, we build an organized, audited, and progressive movement.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={isLoggedIn ? '/dashboard' : '/register'}
              className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 hover:-translate-y-0.5 text-center flex items-center justify-center space-x-2"
            >
              <span>{isLoggedIn ? 'Go to Dashboard' : 'Register as a Member'}</span>
              {isLoggedIn && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              )}
            </Link>
            <Link
              href="#about"
              className="w-full sm:w-auto bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-xl font-bold text-base hover:border-emerald-300 hover:text-emerald-700 transition-all shadow-sm text-center"
            >
              Explore Our Mission
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 pt-12 border-t border-emerald-100/60 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700">20</div>
              <div className="text-xs sm:text-sm font-medium text-gray-500 mt-1">Ogun State LGAs</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700">236</div>
              <div className="text-xs sm:text-sm font-medium text-gray-500 mt-1">Electoral Wards</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700">5,000+</div>
              <div className="text-xs sm:text-sm font-medium text-gray-500 mt-1">Polling Units</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700">100%</div>
              <div className="text-xs sm:text-sm font-medium text-gray-500 mt-1">Grassroots Driven</div>
            </div>
          </div>
        </div>
      </section>

      {/* About & Structure Section */}
      <section id="about" className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Who We Are
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4 mb-4">
              A Movement Built From the Ground Up
            </h2>
            <p className="text-gray-600 leading-relaxed">
              GMT is a structured, technology-powered political mobilization platform designed to organize citizens at every level of Nigeria&apos;s democratic structure — from the smallest polling unit to the national assembly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-emerald-50/40 p-8 rounded-2xl border border-emerald-100/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mb-6 shadow-sm">
                01
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Digital Membership Registry</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Every member is uniquely identified from their polling unit through biometric data, NIN, and voter card records — creating Nigeria&apos;s first verified grassroots digital registry.
              </p>
            </div>

            <div className="bg-emerald-50/40 p-8 rounded-2xl border border-emerald-100/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mb-6 shadow-sm">
                02
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Ward-Level Governance</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Dedicated ward coordinators, LGA directors, and state executives manage community activities, attendance records, and empowerment delivery through our platform.
              </p>
            </div>

            <div className="bg-emerald-50/40 p-8 rounded-2xl border border-emerald-100/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mb-6 shadow-sm">
                03
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Renewed Hope in Action</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Direct economic initiatives, vocational sponsorships, and agricultural grants delivered straight into the hands of local youths, women, and families.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section — Live from API (Upcoming & Past Inaugurations) */}
      <section id="events" className="py-24 bg-emerald-50/30 border-t border-b border-emerald-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-white px-3 py-1 rounded-full border border-emerald-100 shadow-xs">
                Official Movements &amp; Congresses
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4">
                GMT Events &amp; State Inaugurations
              </h2>
              <p className="text-gray-500 text-sm mt-2 max-w-2xl">
                Stay connected with live campaign flag-offs, or view high-resolution photo galleries and video archives from our historic state chapter inaugurations.
              </p>
            </div>
            <Link
              href={isLoggedIn ? '/dashboard/events' : '/register'}
              className="mt-4 md:mt-0 text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
            >
              <span>{isLoggedIn ? 'View all events in member portal' : 'Register to attend an event'}</span>
              <span>&rarr;</span>
            </Link>
          </div>

          {eventsLoading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-3xl p-7 border border-emerald-100 animate-pulse h-72 shadow-sm" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-12">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Events Published Yet</h3>
              <p className="text-gray-500 text-sm">Check back soon — the administrative team will publish upcoming schedules here.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {events.slice(0, 6).map((evt) => {
                const isPast = !!evt.isPast || new Date(evt.startDate) < new Date();
                const photoCount = (evt.images?.length || 0) + (evt.imageUrl ? 1 : 0);
                const videoCount = (evt.videos?.length || 0) + (evt.videoUrl ? 1 : 0);

                return (
                  <Link
                    key={evt.id}
                    href={`/events/${evt.id}`}
                    className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Thumbnail */}
                      {evt.imageUrl && (
                        <div className="h-48 w-full overflow-hidden bg-gray-100 relative">
                          <img
                            src={evt.imageUrl}
                            alt={evt.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 left-3 flex gap-1.5">
                            <span
                              className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full text-white shadow ${
                                isPast ? 'bg-amber-600' : 'bg-emerald-600'
                              }`}
                            >
                              {isPast ? 'Past Event' : 'Upcoming'}
                            </span>
                            {evt.category && (
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 text-gray-800 backdrop-blur-xs shadow">
                                {evt.category}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="p-6">
                        {!evt.imageUrl && (
                          <div className="flex items-center justify-between mb-3">
                            <span
                              className={`text-xs font-bold px-3 py-1 rounded-full ${
                                isPast ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'
                              }`}
                            >
                              {isPast ? 'Past Inauguration' : 'Upcoming Summit'}
                            </span>
                          </div>
                        )}

                        {/* Media badges */}
                        {(photoCount > 0 || videoCount > 0) && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {photoCount > 0 && (
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                📸 {photoCount} Photos
                              </span>
                            )}
                            {videoCount > 0 && (
                              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                                🎥 Video Highlights
                              </span>
                            )}
                          </div>
                        )}

                        <h3 className="text-lg font-black text-gray-900 mb-2 leading-snug group-hover:text-emerald-600 transition-colors">
                          {evt.title}
                        </h3>
                        <p className="text-gray-500 text-xs mb-4 leading-relaxed line-clamp-3">
                          {evt.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 pt-0 border-t border-gray-50">
                      <div className="text-xs font-semibold text-emerald-700 mb-1">
                        {new Date(evt.startDate).toLocaleDateString('en-NG', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      {evt.location && (
                        <div className="text-xs text-gray-500 mb-3 truncate">📍 {evt.location}</div>
                      )}
                      <div className="block text-center bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white text-emerald-700 font-bold text-xs py-2.5 rounded-xl transition-all">
                        {isPast ? 'View Coverage & Pictures →' : 'View Event Details & RSVP →'}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Gallery Section — Photos & Videos Preview with 'See More' to /gallery */}
      <section id="gallery" className="py-24 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 shadow-2xs">
                📸 Visual Archives &amp; Live Media
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4">
                GMT Moments, Inaugurations &amp; Grassroots Action
              </h2>
              <p className="text-gray-500 text-sm mt-2 max-w-2xl">
                Explore high-definition photo galleries and video coverage from our state chapter inaugurations,
                ward rallies, and citizen empowerment drives across Nigeria.
              </p>
            </div>
            <Link
              href="/gallery"
              className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 group bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-200 transition-all shrink-0"
            >
              <span>See More in Full Gallery</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-2 mb-8 bg-gray-50 p-1.5 rounded-2xl w-fit border border-gray-100">
            <button
              onClick={() => setGalleryFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                galleryFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Highlights ({galleryItems.length})
            </button>
            <button
              onClick={() => setGalleryFilter('photo')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                galleryFilter === 'photo'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>📸</span>
              <span>Photos ({galleryItems.filter((i) => i.type === 'photo').length})</span>
            </button>
            <button
              onClick={() => setGalleryFilter('video')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                galleryFilter === 'video'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>🎥</span>
              <span>Videos ({galleryItems.filter((i) => i.type === 'video').length})</span>
            </button>
          </div>

          {/* Media Grid Preview (Top 6 Items) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {galleryItems
              .filter((item) => (galleryFilter === 'all' ? true : item.type === galleryFilter))
              .slice(0, 6)
              .map((item) => {
                const isVideo = item.type === 'video';
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (isVideo) setActiveVideo(item);
                      else setActivePhoto(item);
                    }}
                    className="group cursor-pointer bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image or Video Thumbnail */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-900">
                        <img
                          src={isVideo ? item.thumbnailUrl || item.url : item.url}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                          loading="lazy"
                        />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full text-white shadow-md ${
                              isVideo ? 'bg-rose-600' : 'bg-emerald-600'
                            }`}
                          >
                            {isVideo ? '🎥 Video' : '📸 Photo'}
                          </span>
                          {item.category && (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-xs shadow-md">
                              {item.category}
                            </span>
                          )}
                        </div>

                        {/* Video Play Overlay */}
                        {isVideo ? (
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                            <div className="w-13 h-13 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg group-hover:scale-115 transition-transform duration-300">
                              <svg className="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                            <span>🔍 Expand Photo</span>
                          </div>
                        )}
                      </div>

                      {/* Info Content */}
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 text-sm mb-1.5 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-3">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-0 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400 mt-auto">
                      <span className="font-medium text-emerald-700">{item.date || 'GMT Archive'}</span>
                      {item.location && (
                        <span className="truncate max-w-[140px] text-gray-500">📍 {item.location}</span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* 'See More' Call To Action Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-green-700 to-teal-800 text-white p-8 sm:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center space-x-2 text-emerald-200 text-xs font-bold uppercase tracking-wider">
                <span>📁 Complete Media Repository</span>
                <span>•</span>
                <span>{galleryItems.length} Total Pictures &amp; Videos</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Looking for more moments, inaugurations, and photo archives?
              </h3>
              <p className="text-emerald-100 text-xs sm:text-sm max-w-xl">
                Browse our comprehensive visual directory with category filters, full-screen lightbox previews,
                and high-definition video broadcasts from every geopolitical zone.
              </p>
            </div>

            <Link
              href="/gallery"
              className="shrink-0 bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold text-sm px-7 py-4 rounded-2xl shadow-md transition-all hover:scale-102 flex items-center space-x-2"
            >
              <span>See More in Full Gallery ({galleryItems.length})</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Empowerment Programs Section */}
      <section id="empowerments" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Grassroots Impact
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4 mb-4">
              GMT Empowerment Schemes
            </h2>
            <p className="text-gray-600">
              We empower grassroots communities by investing directly in our members through skills, funding, tools, and social intervention.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {empowermentList.map((item, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-b from-white to-emerald-50/40 p-6 rounded-2xl border border-emerald-100 hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    {item.desc}
                  </p>
                </div>
                <div className="pt-4 border-t border-emerald-100/80">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-md">
                    {item.stat}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GMT Media & News Section */}
      <section id="media" className="py-24 bg-emerald-50/20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-white px-3 py-1 rounded-full border border-emerald-100">
              Newsroom &amp; Insights
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4 mb-4">
              GMT Media &amp; Press Releases
            </h2>
            <p className="text-gray-600">
              Stay informed with official announcements, field updates, and multimedia highlights from our grassroots activities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {newsList.map((item, idx) => (
              <article
                key={idx}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="p-7">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${item.categoryColor}`}>
                      {item.tag}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{item.date}</span>
                  </div>
                  <div className="mb-4 p-3 bg-emerald-50 rounded-xl inline-block text-emerald-700 font-bold">
                    📰
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-emerald-600 transition-colors cursor-pointer">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {item.summary}
                  </p>
                </div>
                <div className="px-7 py-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">{item.readTime}</span>
                  <Link href={isLoggedIn ? "/dashboard" : "/register"} className="text-emerald-700 font-bold hover:underline">
                    Read Story &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-5xl font-black mb-6">
            Become a Registered GMT Voice Today
          </h2>
          <p className="text-emerald-100 text-lg mb-10 max-w-2xl mx-auto">
            Take part in shaping policies, receiving grassroots empowerment, and securing democratic engagement across Ogun State and Nigeria.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto bg-white text-emerald-800 font-bold px-8 py-4 rounded-xl hover:bg-emerald-50 transition-colors shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Access Member Dashboard</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full sm:w-auto bg-white text-emerald-800 font-bold px-8 py-4 rounded-xl hover:bg-emerald-50 transition-colors shadow-lg"
                >
                  Sign Up Now (Free)
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto bg-emerald-800/60 border border-emerald-400 text-white font-bold px-8 py-4 rounded-xl hover:bg-emerald-800 transition-colors"
                >
                  Already Registered? Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="mb-4">
                <BrandLogo size="md" variant="light" showSubtitle={true} href="/" />
              </div>
              <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
                A unified, technologically-driven platform mobilizing Nigerian citizens at the polling unit, ward, local government, and national tiers.
              </p>
            </div>

            <div>
              <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#about" className="hover:text-emerald-400 transition-colors">About Movement</Link></li>
                <li><Link href="#events" className="hover:text-emerald-400 transition-colors">Events &amp; Congress</Link></li>
                <li><Link href="/gallery" className="hover:text-emerald-400 transition-colors font-medium text-emerald-300">Media Gallery</Link></li>
                <li><Link href="#empowerments" className="hover:text-emerald-400 transition-colors">Empowerment Funds</Link></li>
                <li><Link href="#media" className="hover:text-emerald-400 transition-colors">Press &amp; Media</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                {isLoggedIn ? (
                  <>
                    <li><Link href="/dashboard" className="hover:text-emerald-400 transition-colors font-semibold text-emerald-300">My Dashboard</Link></li>
                    {user?.isAdmin && (
                      <li><Link href="/admin" className="hover:text-emerald-400 transition-colors">Admin Portal</Link></li>
                    )}
                  </>
                ) : (
                  <>
                    <li><Link href="/register" className="hover:text-emerald-400 transition-colors">Join as Member</Link></li>
                    <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Member Sign In</Link></li>
                    <li><Link href="/admin" className="hover:text-emerald-400 transition-colors">Admin Portal</Link></li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
            <p>&copy; 2026 Grassroots Movement for Tinubu (GMT). All rights reserved.</p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-gray-300">Privacy Policy</a>
              <a href="#" className="hover:text-gray-300">Terms of Service</a>
              <a href="#" className="hover:text-gray-300">Ogun State Chapter</a>
            </div>
          </div>
        </div>
      </footer>

      {/* PHOTO LIGHTBOX MODAL */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActivePhoto(null)}
        >
          <button
            onClick={() => setActivePhoto(null)}
            className="absolute top-4 right-4 z-50 text-white/80 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2.5 transition-all"
            aria-label="Close photo view"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            className="relative max-w-4xl w-full bg-gray-950 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex-1 min-h-[300px] sm:min-h-[440px] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={activePhoto.url}
                alt={activePhoto.title}
                className="max-h-[65vh] w-auto max-w-full object-contain select-none"
              />
            </div>
            <div className="p-5 sm:p-6 bg-gray-900 border-t border-gray-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 px-2 py-0.5 rounded-full">
                  {activePhoto.category}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                  {activePhoto.title}
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {activePhoto.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
                  {activePhoto.date && <span>📅 {activePhoto.date}</span>}
                  {activePhoto.location && <span>📍 {activePhoto.location}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/gallery"
                  onClick={() => setActivePhoto(null)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs"
                >
                  See Full Gallery →
                </Link>
                <a
                  href={activePhoto.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700"
                >
                  Full Resolution ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIDEO PLAYER MODAL */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveVideo(null)}
        >
          <button
            onClick={() => setActiveVideo(null)}
            className="absolute top-4 right-4 z-50 text-white/80 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2.5 transition-all"
            aria-label="Close video player"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            className="relative max-w-4xl w-full bg-gray-950 rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
              {(() => {
                const ytId = extractYouTubeId(activeVideo.url);
                if (ytId) {
                  return (
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                      title={activeVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  );
                }
                return (
                  <video
                    src={activeVideo.url}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  >
                    Your browser does not support HTML5 video.
                  </video>
                );
              })()}
            </div>
            <div className="p-5 sm:p-6 bg-gray-900 border-t border-gray-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-600 px-2 py-0.5 rounded-full">
                  Video Recording
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {activeVideo.title}
                </h3>
                <p className="text-xs text-gray-300">
                  {activeVideo.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
                  {activeVideo.date && <span>📅 {activeVideo.date}</span>}
                  {activeVideo.location && <span>📍 {activeVideo.location}</span>}
                </div>
              </div>
              <Link
                href="/gallery"
                onClick={() => setActiveVideo(null)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shrink-0"
              >
                See Full Gallery →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
