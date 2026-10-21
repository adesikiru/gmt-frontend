'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import BrandLogo from '@/components/BrandLogo';

export interface EventDetailData {
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
  status?: string;
  stateId?: string;
  rsvpCount?: number;
  userRsvp?: boolean;
  state?: { id: string; name: string };
}

interface EventDetailsViewProps {
  eventId: string;
  mode?: 'dashboard' | 'public';
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
  );
  return match ? match[1] : null;
}

export default function EventDetailsView({ eventId, mode = 'public' }: EventDetailsViewProps) {
  const { user, token } = useAuth();
  const [event, setEvent] = useState<EventDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);
  const [togglingRsvp, setTogglingRsvp] = useState(false);
  const [userRsvp, setUserRsvp] = useState(false);
  const [rsvpCount, setRsvpCount] = useState(0);

  // Load event details
  useEffect(() => {
    let isMounted = true;
    async function fetchEvent() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.events.get(eventId, user?.id);
        if (res.success && res.data) {
          const data = res.data as EventDetailData;
          if (isMounted) {
            setEvent(data);
            setUserRsvp(!!data.userRsvp);
            setRsvpCount(data.rsvpCount ?? 0);
          }
        } else {
          if (isMounted) setError(res.message || 'Event not found');
        }
      } catch {
        if (isMounted) setError('Failed to load event details. Please check your network.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (eventId) {
      fetchEvent();
    }

    return () => {
      isMounted = false;
    };
  }, [eventId, user?.id]);

  // Toggle RSVP
  const handleToggleRsvp = async () => {
    if (!token) return;
    setTogglingRsvp(true);
    const prevRsvp = userRsvp;
    const prevCount = rsvpCount;

    // Optimistic update
    setUserRsvp(!prevRsvp);
    setRsvpCount(prevRsvp ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const res = await api.events.toggleRsvp(token, eventId);
      if (res.success && res.data) {
        const resData = res.data as { userRsvp: boolean; rsvpCount: number };
        setUserRsvp(resData.userRsvp);
        setRsvpCount(resData.rsvpCount);
      }
    } catch {
      // Revert on error
      setUserRsvp(prevRsvp);
      setRsvpCount(prevCount);
    } finally {
      setTogglingRsvp(false);
    }
  };

  // Copy shareable link
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/events/${eventId}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 3000);
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium text-sm">Loading event details &amp; media...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto text-2xl">
          ⚠️
        </div>
        <h2 className="text-2xl font-black text-gray-900">Event Not Found</h2>
        <p className="text-gray-500 text-sm">{error || 'The requested event could not be found or has been removed.'}</p>
        <div className="pt-2">
          <Link
            href={mode === 'dashboard' ? '/dashboard/events' : '/#events'}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm text-sm"
          >
            ← Back to Events
          </Link>
        </div>
      </div>
    );
  }

  // Format date and time
  const startDateObj = new Date(event.startDate);
  const isPast = event.isPast || startDateObj < new Date();
  const formattedDate = !isNaN(startDateObj.getTime())
    ? startDateObj.toLocaleDateString('en-NG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : event.startDate;

  const formattedTime = !isNaN(startDateObj.getTime())
    ? startDateObj.toLocaleTimeString('en-NG', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }) + ' WAT'
    : '10:00 AM WAT';

  // Consolidate images (imageUrl + images array, deduplicated)
  const allImages: string[] = [];
  if (event.imageUrl && !allImages.includes(event.imageUrl)) {
    allImages.push(event.imageUrl);
  }
  if (Array.isArray(event.images)) {
    for (const img of event.images) {
      if (img && !allImages.includes(img)) {
        allImages.push(img);
      }
    }
  }

  // Consolidate videos (videoUrl + videos array, deduplicated)
  const allVideos: string[] = [];
  if (event.videoUrl && !allVideos.includes(event.videoUrl)) {
    allVideos.push(event.videoUrl);
  }
  if (Array.isArray(event.videos)) {
    for (const vid of event.videos) {
      if (vid && !allVideos.includes(vid)) {
        allVideos.push(vid);
      }
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Toast */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center space-x-3 text-sm font-semibold animate-slide-up border border-gray-700">
          <span className="text-emerald-400">✓</span>
          <span>Event link copied to clipboard!</span>
        </div>
      )}

      {/* Navigation / Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href={mode === 'dashboard' ? '/dashboard/events' : '/#events'}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-emerald-600 transition-colors bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm"
        >
          ← {mode === 'dashboard' ? 'Back to All Events' : 'Back to Home'}
        </Link>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-emerald-600 transition-colors bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm"
        >
          <span>🔗 Share Event</span>
        </button>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        {/* Cover image if available */}
        {event.imageUrl ? (
          <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-gray-900">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute top-6 left-6 flex flex-wrap gap-2">
              <span className="text-xs font-black uppercase px-3 py-1.5 rounded-full bg-emerald-500 text-white tracking-wider shadow">
                {event.category || 'GMT Event'}
              </span>
              <span
                className={`text-xs font-black uppercase px-3 py-1.5 rounded-full tracking-wider shadow ${
                  isPast
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {isPast ? 'Past Event & Highlights' : 'Upcoming Event'}
              </span>
            </div>
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight drop-shadow-md">
                {event.title}
              </h1>
            </div>
          </div>
        ) : (
          <div className="p-8 sm:p-12 bg-gradient-to-br from-emerald-900 via-emerald-800 to-gray-900 text-white relative">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs font-black uppercase px-3 py-1.5 rounded-full bg-emerald-500/90 text-white tracking-wider">
                {event.category || 'GMT Event'}
              </span>
              <span
                className={`text-xs font-black uppercase px-3 py-1.5 rounded-full tracking-wider ${
                  isPast
                    ? 'bg-amber-500/90 text-white'
                    : 'bg-emerald-600/90 text-white'
                }`}
              >
                {isPast ? 'Past Event & Highlights' : 'Upcoming Event'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight mb-4">
              {event.title}
            </h1>
          </div>
        )}

        {/* Event Quick Info Banner */}
        <div className="p-6 sm:p-8 bg-gray-50/50 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              📅 Date
            </span>
            <p className="text-sm font-bold text-gray-900">{formattedDate}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              ⏰ Time
            </span>
            <p className="text-sm font-bold text-gray-900">{formattedTime}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              📍 Venue &amp; Location
            </span>
            <p className="text-sm font-bold text-gray-900">
              {event.location || 'Official Venue Announced Soon'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              👥 Attendance
            </span>
            <p className="text-sm font-bold text-emerald-700">
              {rsvpCount} {rsvpCount === 1 ? 'Person' : 'People'} Attending
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Description & RSVP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Full Description & Media */}
        <div className="lg:col-span-2 space-y-8">
          {/* Detailed Agenda & Description */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">
              Event Overview &amp; Key Details
            </h2>
            <div className="prose prose-emerald text-sm text-gray-700 leading-relaxed space-y-4 whitespace-pre-line">
              {event.description}
            </div>
          </div>

          {/* PHOTO GALLERY SECTION */}
          {allImages.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <span>📸</span> Photo Gallery &amp; Event Pictures
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Live moments and dignitaries captured from this event ({allImages.length} photos)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allImages.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setLightboxImg(imgUrl)}
                    className="group relative h-48 sm:h-56 rounded-2xl overflow-hidden bg-gray-100 cursor-pointer border border-gray-200/80 shadow-sm"
                  >
                    <img
                      src={imgUrl}
                      alt={`${event.title} photo ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-2">
                      <span>🔍 Expand Photo</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIDEO HIGHLIGHTS SECTION */}
          {allVideos.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-5">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <span>🎥</span> Video Coverage &amp; Speeches
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Watch official recordings, inaugural swearing-in, and grassroots addresses
                </p>
              </div>

              <div className="space-y-6">
                {allVideos.map((videoUrl, idx) => {
                  const ytId = extractYouTubeId(videoUrl);
                  return (
                    <div key={idx} className="space-y-2">
                      {ytId ? (
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-md bg-black">
                          <iframe
                            src={`https://www.youtube.com/embed/${ytId}`}
                            title={`Video Coverage ${idx + 1}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full border-0"
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-md flex items-center justify-center">
                          <video
                            src={videoUrl}
                            controls
                            className="w-full h-full object-contain"
                          >
                            Your browser does not support HTML5 video.
                          </video>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 col): Action Card, RSVP, Organizer */}
        <div className="space-y-6">
          {/* RSVP Card */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
              {isPast ? 'Event Status' : 'Event Attendance'}
            </h3>

            {isPast ? (
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <span>✓</span> Completed Official Event
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  This event took place on {formattedDate}. Photos and video coverage are archived above for member records.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-gray-600 leading-relaxed">
                  Reserve your seat and let event coordinators prepare credentials for you at the venue.
                </p>

                {user ? (
                  <button
                    onClick={handleToggleRsvp}
                    disabled={togglingRsvp}
                    className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm transition-all shadow-sm flex items-center justify-center space-x-2 ${
                      userRsvp
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    } disabled:opacity-50`}
                  >
                    <span>{userRsvp ? '✓ You Are Attending' : 'RSVP to Attend'}</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      className="block w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-center bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm"
                    >
                      Sign In to RSVP
                    </Link>
                    <Link
                      href="/register"
                      className="block w-full py-2.5 px-4 rounded-xl font-bold text-xs text-center text-emerald-700 hover:bg-emerald-50 transition-colors"
                    >
                      New member? Register here →
                    </Link>
                  </div>
                )}

                <div className="pt-2 text-center text-xs text-gray-500">
                  👥 <strong className="text-gray-800">{rsvpCount}</strong> leaders confirmed attendance
                </div>
              </div>
            )}
          </div>

          {/* Venue & Location Details Card */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
              Venue Location
            </h3>
            <p className="text-xs text-gray-700 font-semibold leading-relaxed">
              📍 {event.location || 'Venue TBA'}
            </p>
            {event.state && (
              <p className="text-xs text-gray-500">
                Chapter: <strong className="text-gray-700">{event.state.name}</strong>
              </p>
            )}
            <div className="pt-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  event.location || event.title,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
              >
                <span>Open in Google Maps</span> ↗
              </a>
            </div>
          </div>

          {/* Share Box */}
          <div className="bg-emerald-50/60 rounded-3xl border border-emerald-100 p-6 space-y-3 text-center">
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
              Spread the Word
            </h4>
            <p className="text-xs text-emerald-800">
              Invite ward leaders, executives, and party faithful to attend.
            </p>
            <div className="flex justify-center gap-2 pt-1">
              <button
                onClick={handleShare}
                className="bg-white text-emerald-800 text-xs font-bold px-4 py-2 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                Copy Link
              </button>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Check out this GMT event: ${event.title}\n${typeof window !== 'undefined' ? window.location.href : ''}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* LIGHTBOX MODAL FOR IMAGES */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center">
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute -top-12 right-0 text-white text-xl font-bold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
            >
              ✕ Close
            </button>
            <img
              src={lightboxImg}
              alt="Enlarged view"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
