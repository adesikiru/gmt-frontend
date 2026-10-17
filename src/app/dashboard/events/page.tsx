'use client';

import { useState, useEffect } from 'react';
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
  rsvpCount: number;
  userRsvp: boolean;
}

interface BackendEvent {
  id: string;
  title: string;
  description: string;
  location?: string;
  startDate: string;
  endDate?: string;
  rsvpCount?: number;
  userRsvp?: boolean;
}

const fallbackEvents: EventItem[] = [
  {
    id: 'evt-1',
    title: 'Ogun Central Grassroots Leadership Townhall',
    category: 'Leadership Summit',
    date: 'Saturday, Nov 15, 2026',
    time: '10:00 AM WAT',
    venue: 'June 12 Cultural Centre, Kuto, Abeokuta',
    lga: 'Abeokuta South',
    description: 'Strategic gathering of ward mobilizers and grassroots executives to discuss development initiatives and community empowerment.',
    rsvpCount: 142,
    userRsvp: false,
  },
  {
    id: 'evt-2',
    title: 'Ward Coordinators Digital Verification Workshop',
    category: 'Training',
    date: 'Wednesday, Nov 25, 2026',
    time: '11:00 AM WAT',
    venue: 'Ijebu-Ode Town Hall, Ijebu-Ode',
    lga: 'Ijebu Ode',
    description: 'Training ward administrators on verifying voter records and member polling unit validations.',
    rsvpCount: 88,
    userRsvp: false,
  },
  {
    id: 'evt-3',
    title: 'Grassroots Farmers & SME Cooperative Forum',
    category: 'Empowerment',
    date: 'Thursday, Dec 10, 2026',
    time: '09:30 AM WAT',
    venue: 'Sango-Ota Community Centre, Ota',
    lga: 'Ado-Odo/Ota',
    description: 'Distribution of agricultural inputs, fertilizer vouchers, and SME seed grants to rural cooperative members.',
    rsvpCount: 215,
    userRsvp: false,
  },
  {
    id: 'evt-4',
    title: 'Ogun West Youth Innovation & Leadership Summit',
    category: 'Leadership Summit',
    date: 'Saturday, Dec 20, 2026',
    time: '11:00 AM WAT',
    venue: 'Ilaro Civic Centre, Ilaro',
    lga: 'Yewa South',
    description: 'Interactive symposium connecting young tech innovators, artisans, and student leaders with mentorship and equipment vouchers.',
    rsvpCount: 176,
    userRsvp: false,
  },
];

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
  const [events, setEvents] = useState<EventItem[]>(fallbackEvents);
  const [filter, setFilter] = useState('All');
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

  // Load events from backend API on mount or when user changes
  useEffect(() => {
    let isMounted = true;
    const storedRsvps = getStoredRsvps();

    async function fetchEvents() {
      try {
        const res = await api.events.list(user?.id ? { userId: user.id } : undefined);
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const apiEvents = res.data as BackendEvent[];
          const formatted: EventItem[] = apiEvents.map((e) => {
            // Determine if user has RSVP'd from backend or localStorage
            const userRsvp = e.userRsvp !== undefined ? e.userRsvp : !!storedRsvps[e.id];
            return {
              id: e.id,
              title: e.title,
              category: 'Leadership Summit',
              date: formatEventDate(e.startDate),
              time: formatEventTime(e.startDate),
              venue: e.location || 'Ogun State GMT Secretariat',
              lga: 'Ogun State',
              description: e.description,
              rsvpCount: (e.rsvpCount ?? 50) + (userRsvp && !e.userRsvp ? 1 : 0),
              userRsvp,
            };
          });

          if (isMounted) {
            setEvents(formatted);
            setLoading(false);
          }
          return;
        }
      } catch {
        // Fallback
      }

      // If backend returns empty or network error, use fallbackEvents merged with stored RSVPs
      if (isMounted) {
        setEvents((prev) =>
          prev.map((evt) => {
            const hasRsvp = !!storedRsvps[evt.id];
            return {
              ...evt,
              userRsvp: hasRsvp,
              rsvpCount: hasRsvp && !evt.userRsvp ? evt.rsvpCount + 1 : evt.rsvpCount,
            };
          })
        );
        setLoading(false);
      }
    }

    fetchEvents();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Toggle RSVP
  const toggleRsvp = async (id: string) => {
    let nextStatus = false;
    let eventTitle = '';

    // 1. Optimistic UI update
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

    // 2. Persist in localStorage immediately so reload NEVER clears it
    saveStoredRsvp(id, nextStatus);

    // 3. Show feedback toast
    if (nextStatus) {
      setToastMessage(`✓ RSVP Confirmed: You are attending "${eventTitle.slice(0, 35)}..."`);
    } else {
      setToastMessage(`RSVP Removed for "${eventTitle.slice(0, 35)}..."`);
    }
    setTimeout(() => setToastMessage(null), 4000);

    // 4. Call backend API if user is authenticated and token is available
    if (token) {
      try {
        await api.events.toggleRsvp(token, id);
      } catch {
        // Already persisted in localStorage as fallback
      }
    }
  };

  const categories = ['All', 'Leadership Summit', 'Training', 'Empowerment'];
  const filteredEvents = filter === 'All' ? events : events.filter((e) => e.category === filter);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center space-x-3 text-sm font-semibold animate-slide-up border border-gray-700">
          <span className="text-emerald-400">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Events &amp; Congresses</h1>
          <p className="text-sm text-gray-500 mt-1">
            Stay active and attend official GMT meetings, leadership summits, and ward workshops.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm animate-pulse h-40" />
          ))}
        </div>
      ) : (
        /* Events List */
        <div className="space-y-4">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className={`bg-white rounded-3xl border p-6 md:p-8 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between gap-6 ${
                evt.userRsvp ? 'border-emerald-300 ring-2 ring-emerald-50' : 'border-gray-100'
              }`}
            >
              <div className="space-y-3 flex-1">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {evt.category}
                  </span>
                  <span className="text-xs font-medium text-gray-500">
                    👥 {evt.rsvpCount} Attending
                  </span>
                  {evt.userRsvp && (
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      ✓ You are attending
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{evt.title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{evt.description}</p>
                <div className="flex flex-wrap gap-y-2 gap-x-6 text-xs text-gray-500 pt-2">
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
                    <span>{evt.venue}</span>
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col justify-end items-end gap-3 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => toggleRsvp(evt.id)}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center space-x-2 ${
                    evt.userRsvp
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <span>{evt.userRsvp ? '✓ Attending' : 'RSVP to Attend'}</span>
                </button>
              </div>
            </div>
          ))}

          {filteredEvents.length === 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-500">
              <div className="text-4xl mb-3">📅</div>
              <h3 className="font-bold text-gray-800 text-lg">No events in this category</h3>
              <p className="text-xs text-gray-400 mt-1">Try selecting another filter from above.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
