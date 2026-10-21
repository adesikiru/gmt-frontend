'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

interface EventItem {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  lga: string;
  description: string;
  imageUrl?: string;
  images?: string[];
  videoUrl?: string;
  videos?: string[];
  isPast: boolean;
  rsvpCount: number;
  userRsvp: boolean;
  rawDate: Date;
}

interface BackendEvent {
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
  rsvpCount?: number;
  userRsvp?: boolean;
}

function formatEventDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-NG', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatEventTime(dateStr: string) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '10:00 AM WAT';
    return d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' WAT';
  } catch {
    return '10:00 AM WAT';
  }
}

export default function EventsPage() {
  const { user, token } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [viewTab, setViewTab] = useState<'all' | 'upcoming' | 'past'>('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Storage key specific to current user ID (or guest)
  const storageKey = `gmt_rsvps_${user?.id || 'default'}`;

  // Helper to read cached RSVPs
  const getStoredRsvps = (): Record<string, boolean> => {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  // Helper to save cached RSVPs
  const saveStoredRsvp = (eventId: string, isRsvp: boolean) => {
    if (typeof window === 'undefined') return;
    try {
      const current = getStoredRsvps();
      if (isRsvp) {
        current[eventId] = true;
      } else {
        delete current[eventId];
      }
      localStorage.setItem(storageKey, JSON.stringify(current));
    } catch {
      // ignore
    }
  };

  // Load real production events from backend API
  useEffect(() => {
    let isMounted = true;
    const storedRsvps = getStoredRsvps();

    async function fetchEvents() {
      setLoading(true);
      try {
        const res = await api.events.list(user?.id ? { userId: user.id } : undefined);
        if (res.success && Array.isArray(res.data)) {
          const apiEvents = res.data as BackendEvent[];
          const formatted: EventItem[] = apiEvents.map((e) => {
            const userRsvp = e.userRsvp !== undefined ? e.userRsvp : !!storedRsvps[e.id];
            const rawDate = new Date(e.startDate);
            const isPastCalculated = !!e.isPast || rawDate < new Date();

            return {
              id: e.id,
              title: e.title,
              category: e.category || (isPastCalculated ? 'Inauguration Ceremony' : 'Leadership Summit'),
              date: formatEventDate(e.startDate),
              time: formatEventTime(e.startDate),
              venue: e.location || 'Official Venue Announced Soon',
              lga: 'State Secretariat',
              description: e.description,
              imageUrl: e.imageUrl,
              images: e.images || [],
              videoUrl: e.videoUrl,
              videos: e.videos || [],
              isPast: isPastCalculated,
              rawDate,
              rsvpCount: (e.rsvpCount ?? 0) + (userRsvp && !e.userRsvp ? 1 : 0),
              userRsvp,
            };
          });

          if (isMounted) {
            setEvents(formatted);
          }
        } else {
          if (isMounted) setEvents([]);
        }
      } catch {
        if (isMounted) setEvents([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchEvents();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Toggle RSVP
  const toggleRsvp = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    let nextStatus = false;
    let eventTitle = '';

    // Optimistic UI update
    setEvents((prev) =>
      prev.map((evt) => {
        if (evt.id === id) {
          nextStatus = !evt.userRsvp;
          eventTitle = evt.title;
          return {
            ...evt,
            userRsvp: nextStatus,
            rsvpCount: nextStatus ? evt.rsvpCount + 1 : Math.max(0, evt.rsvpCount - 1),
          };
        }
        return evt;
      })
    );

    // Persist in localStorage
    saveStoredRsvp(id, nextStatus);

    // Show feedback toast
    if (nextStatus) {
      setToastMessage(`✓ RSVP Confirmed: You are attending "${eventTitle.slice(0, 32)}..."`);
    } else {
      setToastMessage(`RSVP Removed for "${eventTitle.slice(0, 32)}..."`);
    }
    setTimeout(() => setToastMessage(null), 4000);

    // Call backend API
    if (token) {
      try {
        await api.events.toggleRsvp(token, id);
      } catch {
        // Handled optimistically
      }
    }
  };

  // Derive upcoming vs past
  const upcomingEvents = events.filter((e) => !e.isPast);
  const pastEvents = events.filter((e) => e.isPast);

  // Available categories
  const allCategories = ['All', ...Array.from(new Set(events.map((e) => e.category).filter(Boolean)))];

  // Filter based on viewTab and selectedCategory
  const filterList = (list: EventItem[]) => {
    if (selectedCategory === 'All') return list;
    return list.filter((e) => e.category === selectedCategory);
  };

  const displayedUpcoming = filterList(upcomingEvents);
  const displayedPast = filterList(pastEvents);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center space-x-3 text-sm font-semibold animate-slide-up border border-gray-700">
          <span className="text-emerald-400">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Events &amp; Congresses</h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse upcoming summits &amp; flag-offs, or view photo &amp; video archives from past state inaugurations.
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-2xl self-start sm:self-center border border-gray-200">
          <button
            onClick={() => setViewTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewTab === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            All Events ({events.length})
          </button>
          <button
            onClick={() => setViewTab('upcoming')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewTab === 'upcoming'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Upcoming ({upcomingEvents.length})
          </button>
          <button
            onClick={() => setViewTab('past')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewTab === 'past'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Past &amp; Inaugurations ({pastEvents.length})
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      {allCategories.length > 2 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">
            Category:
          </span>
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm animate-pulse h-48" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center text-gray-500 space-y-3">
          <div className="text-4xl">📅</div>
          <h3 className="font-bold text-gray-800 text-lg">No Events Scheduled At This Time</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            The administrative team will publish upcoming mobilization rallies, flag-offs, and state congresses here.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* SECTION 1: UPCOMING EVENTS */}
          {(viewTab === 'all' || viewTab === 'upcoming') && (
            <section className="space-y-5">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h2 className="text-xl font-black text-gray-900">
                    Upcoming GMT Events &amp; Flag-Offs
                  </h2>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {displayedUpcoming.length} Scheduled
                  </span>
                </div>
              </div>

              {displayedUpcoming.length === 0 ? (
                <div className="bg-emerald-50/40 rounded-3xl border border-emerald-100/60 p-8 text-center text-emerald-800 text-sm">
                  No upcoming events in this category right now.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {displayedUpcoming.map((evt) => (
                    <Link
                      key={evt.id}
                      href={`/dashboard/events/${evt.id}`}
                      className={`group bg-white rounded-3xl border p-6 md:p-8 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between gap-6 cursor-pointer ${
                        evt.userRsvp ? 'border-emerald-300 ring-2 ring-emerald-50' : 'border-gray-100 hover:border-emerald-200'
                      }`}
                    >
                      {/* Left: Thumbnail & Details */}
                      <div className="flex flex-col sm:flex-row gap-6 flex-1">
                        {evt.imageUrl && (
                          <div className="w-full sm:w-48 h-36 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                            <img
                              src={evt.imageUrl}
                              alt={evt.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="space-y-3 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {evt.category}
                            </span>
                            <span className="text-xs font-semibold text-gray-500">
                              👥 {evt.rsvpCount} Attending
                            </span>
                            {evt.userRsvp && (
                              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                ✓ You are attending
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                            {evt.title}
                          </h3>
                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                            {evt.description}
                          </p>
                          <div className="flex flex-wrap gap-y-2 gap-x-6 text-xs text-gray-500 pt-1">
                            <div className="flex items-center space-x-1.5">
                              <span>📅</span>
                              <strong className="text-gray-700">{evt.date}</strong>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <span>⏰</span>
                              <span>{evt.time}</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <span>📍</span>
                              <span className="text-gray-700">{evt.venue}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: RSVP & Action */}
                      <div className="flex md:flex-col justify-end items-end gap-3 self-end md:self-center shrink-0">
                        <button
                          type="button"
                          onClick={(e) => toggleRsvp(e, evt.id)}
                          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5 ${
                            evt.userRsvp
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          <span>{evt.userRsvp ? '✓ Attending' : 'RSVP to Attend'}</span>
                        </button>
                        <span className="text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          View Details &amp; Media →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* SECTION 2: PAST EVENTS & INAUGURATIONS */}
          {(viewTab === 'all' || viewTab === 'past') && (
            <section className="space-y-5">
              <div className="flex items-center justify-between border-b border-amber-200/70 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🏆</span>
                  <h2 className="text-xl font-black text-gray-900">
                    Past Events, State Inaugurations &amp; Coverage
                  </h2>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    {displayedPast.length} Recorded
                  </span>
                </div>
              </div>

              {displayedPast.length === 0 ? (
                <div className="bg-amber-50/40 rounded-3xl border border-amber-100 p-8 text-center text-amber-800 text-sm">
                  No past events archived in this category yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {displayedPast.map((evt) => {
                    const photoCount = (evt.images?.length || 0) + (evt.imageUrl ? 1 : 0);
                    const videoCount = (evt.videos?.length || 0) + (evt.videoUrl ? 1 : 0);

                    return (
                      <Link
                        key={evt.id}
                        href={`/dashboard/events/${evt.id}`}
                        className="group bg-white rounded-3xl border border-gray-100 hover:border-amber-300 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer"
                      >
                        <div className="space-y-3">
                          {/* Image preview */}
                          {evt.imageUrl && (
                            <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-gray-100">
                              <img
                                src={evt.imageUrl}
                                alt={evt.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-3 left-3 flex gap-2">
                                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-600 text-white shadow">
                                  Past Inauguration
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                              {evt.category}
                            </span>
                            {photoCount > 0 && (
                              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                📸 {photoCount} Photos
                              </span>
                            )}
                            {videoCount > 0 && (
                              <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                                🎥 Video Highlights
                              </span>
                            )}
                          </div>

                          <h3 className="text-lg font-black text-gray-900 group-hover:text-amber-800 transition-colors">
                            {evt.title}
                          </h3>
                          <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                            {evt.description}
                          </p>
                        </div>

                        <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs text-gray-500">
                          <div>
                            📍 <span className="font-semibold text-gray-700">{evt.venue}</span>
                          </div>
                          <span className="font-bold text-amber-700 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                            View Coverage &amp; Pictures →
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
