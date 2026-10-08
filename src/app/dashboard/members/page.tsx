'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';


interface MemberDirectoryItem {
  id: string;
  status: string;
  membershipNumber?: string;
  createdAt: string;
  user: { email?: string; phone?: string };
  profile?: {
    firstName?: string;
    lastName?: string;
    state?: { name: string };
    lga?: { name: string };
    ward?: { name: string };
    isRegisteredVoter?: boolean;
  };
}

const AVATAR_COLORS = [
  'bg-emerald-600',
  'bg-teal-600',
  'bg-green-600',
  'bg-emerald-700',
  'bg-teal-700',
  'bg-green-700',
];

export default function MembersPage() {
  const { token, user, loading } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState<MemberDirectoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !token) router.push('/login');
  }, [loading, token, router]);

  const fetchMembers = useCallback(async () => {
    if (!token) return;
    setLoadingData(true);
    setError(null);
    try {
      const res = await api.membership.list(token);
      if (res.success && res.data) {
        const d = res.data as { memberships: MemberDirectoryItem[]; total: number };
        setMembers(d.memberships);
        setTotal(d.total);
      } else {
        setError(res.message ?? 'Failed to load members');
      }
    } catch {
      setError('Could not connect to the server');
    }
    setLoadingData(false);
  }, [token]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const filtered = members.filter((m) => {
    const name = `${m.profile?.firstName ?? ''} ${m.profile?.lastName ?? ''}`.toLowerCase();
    const ward = m.profile?.ward?.name?.toLowerCase() ?? '';
    const q = search.toLowerCase();
    return name.includes(q) || ward.includes(q) || (m.user.email ?? '').toLowerCase().includes(q);
  });

  const uniqueLgas = ['All', ...Array.from(new Set(members.map((m) => m.profile?.lga?.name).filter(Boolean) as string[]))];
  const [filterLga, setFilterLga] = useState('All');

  const filteredByLga = filtered.filter(
    (m) => filterLga === 'All' || m.profile?.lga?.name === filterLga,
  );

  // Non-admin users should not see the members directory
  if (!loading && user && !user.isAdmin) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center bg-yellow-50 border border-yellow-200 rounded-2xl p-10">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-yellow-800 mb-2">Admin Access Required</h2>
        <p className="text-yellow-700 text-sm">
          The Members Directory is only available to administrators. 
          Contact your state coordinator if you believe you should have access.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Members Directory</h1>
          <p className="text-sm text-gray-500 mt-1">
            All registered members across Ogun State wards — live from the database.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-full">
            {total} Registered Members
          </span>
          <button
            onClick={fetchMembers}
            className="text-xs font-semibold text-gray-500 hover:text-emerald-700 px-2 py-1.5 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by name, email or ward..."
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

      {/* Loading / Error States */}
      {loadingData && (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
        </div>
      )}

      {!loadingData && error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-700 font-semibold text-sm">{error}</p>
          <p className="text-red-500 text-xs mt-1">
            Make sure you are signed in as an admin, or the backend is running.
          </p>
        </div>
      )}

      {/* Members Grid */}
      {!loadingData && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredByLga.map((member, idx) => {
              const firstName = member.profile?.firstName ?? '';
              const lastName = member.profile?.lastName ?? '';
              const initials =
                [firstName, lastName]
                  .filter(Boolean)
                  .map((n) => n[0].toUpperCase())
                  .join('') || '??';
              const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const isVoter = member.profile?.isRegisteredVoter ?? false;

              return (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-2xl ${avatarColor} text-white font-extrabold flex items-center justify-center text-lg shadow-sm`}
                      >
                        {initials}
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          isVoter
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {isVoter ? '✓ Registered Voter' : 'General Member'}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-base leading-tight mb-1">
                      {firstName} {lastName}
                    </h3>
                    <p className="text-xs text-gray-500 mb-1">{member.user.email ?? member.user.phone}</p>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full inline-block ${
                        member.status === 'VERIFIED'
                          ? 'bg-green-100 text-green-800'
                          : member.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : member.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {member.status}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-gray-50 text-xs text-gray-500 space-y-1 mt-3">
                    {member.profile?.state?.name && (
                      <div><strong className="text-gray-700">State:</strong> {member.profile.state.name}</div>
                    )}
                    {member.profile?.lga?.name && (
                      <div><strong className="text-gray-700">LGA:</strong> {member.profile.lga.name}</div>
                    )}
                    {member.profile?.ward?.name && (
                      <div><strong className="text-gray-700">Ward:</strong> {member.profile.ward.name}</div>
                    )}
                    <div><strong className="text-gray-700">Joined:</strong> {new Date(member.createdAt).toLocaleDateString('en-NG')}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredByLga.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-gray-400">
              {members.length === 0
                ? 'No members registered yet.'
                : 'No members found matching your search.'}
            </div>
          )}
        </>
      )}
    </div>
  );
}
