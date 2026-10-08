'use client';

import { useState } from 'react';

interface MemberDirectoryItem {
  id: string;
  name: string;
  role: string;
  lga: string;
  ward: string;
  isVoter: boolean;
  joined: string;
  avatarColor: string;
}

const sampleDirectory: MemberDirectoryItem[] = [
  { id: '1', name: 'Alhaji Olatunji Adeyemi', role: 'State Coordinator', lga: 'Abeokuta South', ward: 'Ake', isVoter: true, joined: 'Oct 2026', avatarColor: 'bg-emerald-600' },
  { id: '2', name: 'Mrs. Folashade Bakare', role: 'Women Leader', lga: 'Ijebu Ode', ward: 'Itoro', isVoter: true, joined: 'Oct 2026', avatarColor: 'bg-teal-600' },
  { id: '3', name: 'Engr. Babatunde Sowunmi', role: 'Youth Mobilizer', lga: 'Ado-Odo/Ota', ward: 'Sango I', isVoter: true, joined: 'Nov 2026', avatarColor: 'bg-green-600' },
  { id: '4', name: 'Dr. Kehinde Osoba', role: 'Ward Secretary', lga: 'Ifo', ward: 'Ifo I', isVoter: true, joined: 'Nov 2026', avatarColor: 'bg-emerald-700' },
  { id: '5', name: 'Amaka Eze', role: 'General Member', lga: 'Sagamu', ward: 'Makun', isVoter: false, joined: 'Nov 2026', avatarColor: 'bg-teal-700' },
  { id: '6', name: 'Tosin Adebayo', role: 'Grassroots Member', lga: 'Ewekoro', ward: 'Itori I', isVoter: true, joined: 'Dec 2026', avatarColor: 'bg-green-700' },
];

export default function MembersPage() {
  const [search, setSearch] = useState('');
  const [filterLga, setFilterLga] = useState('All');

  const filtered = sampleDirectory.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.ward.toLowerCase().includes(search.toLowerCase());
    const matchesLga = filterLga === 'All' || m.lga === filterLga;
    return matchesSearch && matchesLga;
  });

  const uniqueLgas = ['All', ...Array.from(new Set(sampleDirectory.map((m) => m.lga)))];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Members Directory</h1>
          <p className="text-sm text-gray-500 mt-1">
            Connect with grassroots members, coordinators, and leaders across Ogun State.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-full">
            {sampleDirectory.length} Registered Members Listed
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by name or ward..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-gray-500">LGA:</label>
          <select
            value={filterLga}
            onChange={(e) => setFilterLga(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            {uniqueLgas.map((lga) => (
              <option key={lga} value={lga}>{lga}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${member.avatarColor} text-white font-extrabold flex items-center justify-center text-lg shadow-sm`}>
                  {member.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                  member.isVoter ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600'
                }`}>
                  {member.isVoter ? '✓ Registered Voter' : 'General Member'}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-base leading-tight mb-1">{member.name}</h3>
              <p className="text-xs font-semibold text-emerald-700 mb-3">{member.role}</p>
            </div>

            <div className="pt-4 border-t border-gray-50 text-xs text-gray-500 space-y-1">
              <div><strong className="text-gray-700">LGA:</strong> {member.lga}</div>
              <div><strong className="text-gray-700">Ward:</strong> {member.ward}</div>
              <div><strong className="text-gray-700">Joined:</strong> {member.joined}</div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-gray-400">
          No members found matching your search.
        </div>
      )}
    </div>
  );
}
