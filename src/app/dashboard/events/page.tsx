'use client';

import { useState } from 'react';

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

const initialEvents: EventItem[] = [
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
    userRsvp: true,
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
];

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [filter, setFilter] = useState('All');

  const toggleRsvp = (id: string) => {
    setEvents((prev) =>
      prev.map((evt) => {
        if (evt.id === id) {
          const nextRsvp = !evt.userRsvp;
          return {
            ...evt,
            userRsvp: nextRsvp,
            rsvpCount: nextRsvp ? evt.rsvpCount + 1 : evt.rsvpCount - 1,
          };
        }
        return evt;
      })
    );
  };

  const categories = ['All', 'Leadership Summit', 'Training', 'Empowerment'];
  const filteredEvents = filter === 'All' ? events : events.filter((e) => e.category === filter);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Events & Congresses</h1>
          <p className="text-sm text-gray-500 mt-1">
            Stay active and attend official GMT meetings, training sessions, and summits.
          </p>
        </div>
        <div className="flex space-x-2">
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

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between gap-6"
          >
            <div className="space-y-3 flex-1">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {evt.category}
                </span>
                <span className="text-xs font-medium text-gray-400">
                  {evt.rsvpCount} Attending
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{evt.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{evt.description}</p>
              <div className="flex flex-wrap gap-y-2 gap-x-6 text-xs text-gray-500 pt-2">
                <div className="flex items-center space-x-1">
                  <span>📅</span>
                  <strong className="text-gray-700">{evt.date}</strong>
                </div>
                <div className="flex items-center space-x-1">
                  <span>⏰</span>
                  <span>{evt.time}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>📍</span>
                  <span>{evt.venue} ({evt.lga})</span>
                </div>
              </div>
            </div>

            <div className="flex md:flex-col justify-end items-end gap-3 self-end md:self-center">
              <button
                onClick={() => toggleRsvp(evt.id)}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${
                  evt.userRsvp
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {evt.userRsvp ? '✓ Attending' : 'RSVP to Attend'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
