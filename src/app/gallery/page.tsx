'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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

export default function GalleryPage() {
  const { isLoggedIn, logout, user, loading } = useAuth();

  // Mobile menu toggle
  const [menuOpen, setMenuOpen] = useState(false);

  // Media state
  const [items, setItems] = useState<GalleryItem[]>(defaultGalleryItems);
  const [dataLoading, setDataLoading] = useState(true);

  // Filters
  const [selectedType, setSelectedType] = useState<'all' | 'photo' | 'video'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);
  const [activeVideo, setActiveVideo] = useState<GalleryItem | null>(null);

  // Load events and build complete gallery
  useEffect(() => {
    let isMounted = true;
    api.events
      .list()
      .then((res) => {
        if (isMounted && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const combined = extractMediaFromEvents(res.data);
          setItems(combined);
        }
      })
      .catch(() => {
        // Fallback to default items
      })
      .finally(() => {
        if (isMounted) setDataLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter categories dynamically from items
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ['all', ...Array.from(set)];
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Type filter
      if (selectedType !== 'all' && item.type !== selectedType) return false;

      // Category filter
      if (selectedCategory !== 'all' && item.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchLoc = (item.location || '').toLowerCase().includes(query);
        const matchCat = (item.category || '').toLowerCase().includes(query);
        const matchEvent = (item.eventTitle || '').toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchLoc && !matchCat && !matchEvent) {
          return false;
        }
      }

      return true;
    });
  }, [items, selectedType, selectedCategory, searchQuery]);

  // Photo-only list for next/previous lightbox navigation
  const photoList = useMemo(() => {
    return filteredItems.filter((i) => i.type === 'photo');
  }, [filteredItems]);

  const currentPhotoIndex = useMemo(() => {
    if (!activePhoto) return -1;
    return photoList.findIndex((i) => i.id === activePhoto.id);
  }, [activePhoto, photoList]);

  const handleNextPhoto = useCallback(() => {
    if (photoList.length <= 1 || currentPhotoIndex === -1) return;
    const nextIdx = (currentPhotoIndex + 1) % photoList.length;
    setActivePhoto(photoList[nextIdx]);
  }, [photoList, currentPhotoIndex]);

  const handlePrevPhoto = useCallback(() => {
    if (photoList.length <= 1 || currentPhotoIndex === -1) return;
    const prevIdx = (currentPhotoIndex - 1 + photoList.length) % photoList.length;
    setActivePhoto(photoList[prevIdx]);
  }, [photoList, currentPhotoIndex]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePhoto) {
        if (e.key === 'Escape') setActivePhoto(null);
        if (e.key === 'ArrowRight') handleNextPhoto();
        if (e.key === 'ArrowLeft') handlePrevPhoto();
      } else if (activeVideo) {
        if (e.key === 'Escape') setActiveVideo(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhoto, activeVideo, handleNextPhoto, handlePrevPhoto]);

  // Overall counts
  const totalPhotos = items.filter((i) => i.type === 'photo').length;
  const totalVideos = items.filter((i) => i.type === 'video').length;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-green-100 selection:text-green-800 flex flex-col justify-between">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 text-white text-xs py-2 px-4 text-center font-medium tracking-wide">
        🇳🇬 Grassroots Movement for Tinubu (GMT) — Official Media &amp; Photographic Repository
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 w-full bg-white/95 backdrop-blur-md z-40 border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <BrandLogo size="md" showSubtitle={true} href="/" />

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-gray-600">
              <Link href="/" className="hover:text-emerald-600 transition-colors">
                Home
              </Link>
              <Link href="/#about" className="hover:text-emerald-600 transition-colors">
                About Us
              </Link>
              <Link href="/#events" className="hover:text-emerald-600 transition-colors">
                Events
              </Link>
              <Link href="/gallery" className="text-emerald-600 font-bold border-b-2 border-emerald-600 pb-0.5">
                Gallery
              </Link>
              <Link href="/#empowerments" className="hover:text-emerald-600 transition-colors">
                Empowerment
              </Link>
              <Link href="/#media" className="hover:text-emerald-600 transition-colors">
                Media &amp; News
              </Link>
            </nav>

            {/* Desktop Auth Section */}
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

            {/* Mobile Hamburger */}
            <div className="flex md:hidden items-center space-x-3">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Toggle navigation menu"
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

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg px-4 py-4 space-y-2">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 text-sm font-semibold text-gray-700 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/#events"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 text-sm font-semibold text-gray-700 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
            >
              Events
            </Link>
            <Link
              href="/gallery"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 text-sm font-bold text-emerald-700 bg-emerald-50 rounded-xl"
            >
              Gallery
            </Link>
            <Link
              href="/#empowerments"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 text-sm font-semibold text-gray-700 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
            >
              Empowerment
            </Link>
            <Link
              href="/#media"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 text-sm font-semibold text-gray-700 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
            >
              Media &amp; News
            </Link>
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-sm"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-semibold text-emerald-700 border border-emerald-200 rounded-xl"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-sm"
                  >
                    Join Movement
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-green-950 text-white pt-14 pb-20">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-emerald-400 blur-3xl"></div>
          <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full bg-teal-300 blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-700/60 border border-emerald-500/30 text-emerald-200 text-xs font-semibold mb-6 backdrop-blur-xs">
            <span>📸 Official Multimedia Archive</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>All Chapters &amp; Wards</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-5 leading-tight">
            GMT Official Gallery &amp; Video Coverage
          </h1>
          <p className="text-base sm:text-lg text-emerald-100 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
            Every memorable milestone, state inauguration ceremony, grassroots empowerment rally,
            and ward-level mobilization recorded and archived for our members and delegates.
          </p>

          {/* Quick Stats Bar */}
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">{items.length}</div>
              <div className="text-xs text-emerald-200 font-medium mt-0.5">Total Media Items</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300">{totalPhotos}</div>
              <div className="text-xs text-emerald-200 font-medium mt-0.5">High-Res Photos</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-300">{totalVideos}</div>
              <div className="text-xs text-emerald-200 font-medium mt-0.5">Video Broadcasts</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">36 + FCT</div>
              <div className="text-xs text-emerald-200 font-medium mt-0.5">States Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        {/* Controls Bar: Type toggle, Search, Category pills */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Media Type Filter Tabs */}
            <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl w-fit">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedType === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Media ({items.length})
              </button>
              <button
                onClick={() => setSelectedType('photo')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  selectedType === 'photo'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>📸</span>
                <span>Photos ({totalPhotos})</span>
              </button>
              <button
                onClick={() => setSelectedType('video')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  selectedType === 'video'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>🎥</span>
                <span>Videos ({totalVideos})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by event, city, topic..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-gray-800 placeholder-gray-400"
              />
              <svg
                className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
              Category:
            </span>
            {categories.map((cat) => {
              const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all capitalize ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold shadow-2xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                  }`}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Grid */}
        {dataLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl h-72 border border-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No Media Matches Found</h3>
            <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto mb-6">
              We couldn&apos;t find any pictures or videos matching your filter criteria. Try clearing your search query or selecting a different category.
            </p>
            <button
              onClick={() => {
                setSelectedType('all');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {filteredItems.map((item) => {
              const isVideo = item.type === 'video';

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (isVideo) setActiveVideo(item);
                    else setActivePhoto(item);
                  }}
                  className="group cursor-pointer rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative"
                >
                  {/* Image */}
                  <div className="relative aspect-square w-full overflow-hidden bg-gray-200">
                    <img
                      src={isVideo ? item.thumbnailUrl || item.url : item.url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Video Play Button Overlay */}
                    {isVideo && (
                      <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Subtle hover zoom indicator for photos */}
                    {!isVideo && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Community Upload CTA */}
      <section className="bg-gradient-to-r from-emerald-800 to-green-700 text-white py-14 border-t border-emerald-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-block p-3 bg-white/10 rounded-2xl text-2xl mb-1">
            📷
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Have Pictures or Videos from Your Ward Assembly?
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Registered Ward Coordinators and LGA Mobilization leads can submit high-resolution media
            coverage to be featured in the official GMT state archive.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={isLoggedIn ? '/dashboard' : '/register'}
              className="bg-white text-emerald-900 hover:bg-emerald-50 px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-md"
            >
              {isLoggedIn ? 'Go to Member Dashboard' : 'Join GMT as a Member'}
            </Link>
            <Link
              href="/#events"
              className="border border-emerald-300 text-white hover:bg-emerald-700/60 px-6 py-3 rounded-xl font-bold text-xs transition-all"
            >
              View Upcoming Events
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="mb-3">
                <BrandLogo size="md" variant="light" showSubtitle={true} href="/" />
              </div>
              <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
                The Grassroots Movement for Tinubu (GMT) official media gallery documents our journey,
                empowerment schemes, and civic engagements from ward to national level.
              </p>
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Navigation</h4>
              <ul className="space-y-1.5 text-xs">
                <li><Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
                <li><Link href="/#events" className="hover:text-emerald-400 transition-colors">Events</Link></li>
                <li><Link href="/gallery" className="text-emerald-400 font-bold">Media Gallery</Link></li>
                <li><Link href="/#empowerments" className="hover:text-emerald-400 transition-colors">Empowerment</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Portal</h4>
              <ul className="space-y-1.5 text-xs">
                {isLoggedIn ? (
                  <li><Link href="/dashboard" className="text-emerald-300 font-semibold">My Dashboard</Link></li>
                ) : (
                  <>
                    <li><Link href="/login" className="hover:text-emerald-400">Sign In</Link></li>
                    <li><Link href="/register" className="hover:text-emerald-400">Register as Member</Link></li>
                  </>
                )}
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500">
            <p>&copy; 2026 Grassroots Movement for Tinubu (GMT). All rights reserved.</p>
            <div className="flex space-x-4 mt-2 sm:mt-0">
              <Link href="/" className="hover:text-gray-300">Home</Link>
              <Link href="/gallery" className="hover:text-gray-300">Gallery</Link>
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
          {/* Close button */}
          <button
            onClick={() => setActivePhoto(null)}
            className="absolute top-4 right-4 z-50 text-white/80 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2.5 transition-all"
            aria-label="Close photo view"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous Arrow */}
          {photoList.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevPhoto();
              }}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-50 bg-black/60 hover:bg-black/90 text-white rounded-full p-3 transition-all hover:scale-110 shadow-lg"
              aria-label="Previous photo"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next Arrow */}
          {photoList.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextPhoto();
              }}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-50 bg-black/60 hover:bg-black/90 text-white rounded-full p-3 transition-all hover:scale-110 shadow-lg"
              aria-label="Next photo"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Modal Container */}
          <div
            className="relative max-w-5xl w-full bg-gray-950 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Preview */}
            <div className="relative flex-1 min-h-[300px] sm:min-h-[460px] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={activePhoto.url}
                alt={activePhoto.title}
                className="max-h-[68vh] w-auto max-w-full object-contain select-none"
              />
            </div>

            {/* Bottom Caption & Details */}
            <div className="p-5 sm:p-6 bg-gray-900 border-t border-gray-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 px-2 py-0.5 rounded-full">
                    {activePhoto.category}
                  </span>
                  {currentPhotoIndex !== -1 && (
                    <span className="text-xs text-gray-400">
                      Photo {currentPhotoIndex + 1} of {photoList.length}
                    </span>
                  )}
                </div>
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
                {activePhoto.eventId && (
                  <Link
                    href={`/events/${activePhoto.eventId}`}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs"
                  >
                    View Event Details →
                  </Link>
                )}
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
          {/* Close button */}
          <button
            onClick={() => setActiveVideo(null)}
            className="absolute top-4 right-4 z-50 text-white/80 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2.5 transition-all"
            aria-label="Close video player"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Modal Container */}
          <div
            className="relative max-w-4xl w-full bg-gray-950 rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Video Player */}
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

            {/* Video Caption & Details */}
            <div className="p-5 sm:p-6 bg-gray-900 border-t border-gray-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-600 px-2 py-0.5 rounded-full">
                    Official Video Coverage
                  </span>
                  <span className="text-xs text-gray-400">{activeVideo.category}</span>
                </div>
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

              {activeVideo.eventId && (
                <Link
                  href={`/events/${activeVideo.eventId}`}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shrink-0"
                >
                  View Event Page →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
