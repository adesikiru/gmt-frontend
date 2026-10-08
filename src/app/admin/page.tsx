'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import BrandLogo from '@/components/BrandLogo';

interface Member {
  id: string;
  status: string;
  membershipNumber?: string;
  createdAt: string;
  user: { email?: string; phone?: string };
  profile?: { firstName?: string; lastName?: string; state?: { name: string }; lga?: { name: string }; ward?: { name: string }; isRegisteredVoter?: boolean };
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  VERIFIED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  SUSPENDED: 'bg-orange-100 text-orange-800',
};

export default function AdminDashboard() {
  const { token, loading } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !token) router.push('/login');
  }, [loading, token, router]);

  const fetchMembers = useCallback(async () => {
    if (!token) return;
    setLoadingData(true);
    const params: Record<string, string> = {};
    if (statusFilter) params.status = statusFilter;
    const res = await api.membership.list(token, params);
    if (res.success && res.data) {
      const d = res.data as { memberships: Member[]; total: number };
      setMembers(d.memberships);
      setTotal(d.total);
    }
    setLoadingData(false);
  }, [token, statusFilter]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleAction = async (action: 'verify' | 'reject' | 'suspend', id: string) => {
    if (!token) return;
    setActionLoading(id + action);
    const reason = action !== 'verify' ? prompt(`Reason for ${action}ing this member?`) ?? undefined : undefined;
    if (action === 'verify') await api.membership.verify(token, id);
    else if (action === 'reject') await api.membership.reject(token, id, reason);
    else if (action === 'suspend') await api.membership.suspend(token, id, reason);
    setActionLoading(null);
    fetchMembers();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <BrandLogo size="sm" showSubtitle={true} href="/admin" />
          <div className="flex items-center space-x-4 text-xs font-bold text-gray-600">
            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">Super Admin Console</span>
            <a href="/dashboard" className="text-emerald-700 hover:text-emerald-800">Member Portal</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Applications', value: total, color: 'text-gray-900' },
            { label: 'Pending', value: members.filter(m => m.status === 'PENDING').length, color: 'text-yellow-700' },
            { label: 'Verified', value: members.filter(m => m.status === 'VERIFIED').length, color: 'text-green-700' },
            { label: 'Rejected/Suspended', value: members.filter(m => ['REJECTED', 'SUSPENDED'].includes(m.status)).length, color: 'text-red-700' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Members table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Membership Applications</h2>
            <select
              value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          {loadingData ? (
            <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div></div>
          ) : members.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No members found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-6 py-3">Member</th>
                    <th className="text-left px-6 py-3">Contact</th>
                    <th className="text-left px-6 py-3">Location</th>
                    <th className="text-left px-6 py-3">Voter</th>
                    <th className="text-left px-6 py-3">Status</th>
                    <th className="text-left px-6 py-3">Date</th>
                    <th className="text-left px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {members.map(m => (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{m.profile?.firstName} {m.profile?.lastName}</div>
                        {m.membershipNumber && <div className="text-xs text-green-600 font-mono">{m.membershipNumber}</div>}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        <div>{m.user.email}</div>
                        <div>{m.user.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        <div>{m.profile?.state?.name}</div>
                        <div>{m.profile?.lga?.name} / {m.profile?.ward?.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium ${m.profile?.isRegisteredVoter ? 'text-green-600' : 'text-gray-400'}`}>
                          {m.profile?.isRegisteredVoter ? '✓ Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColors[m.status] ?? 'bg-gray-100 text-gray-700'}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(m.createdAt).toLocaleDateString('en-NG')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          {m.status === 'PENDING' && (
                            <>
                              <button onClick={() => handleAction('verify', m.id)} disabled={!!actionLoading} className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50">Verify</button>
                              <button onClick={() => handleAction('reject', m.id)} disabled={!!actionLoading} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 disabled:opacity-50">Reject</button>
                            </>
                          )}
                          {m.status === 'VERIFIED' && (
                            <button onClick={() => handleAction('suspend', m.id)} disabled={!!actionLoading} className="text-xs bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600 disabled:opacity-50">Suspend</button>
                          )}
                          {(m.status === 'SUSPENDED' || m.status === 'REJECTED') && (
                            <button onClick={() => handleAction('verify', m.id)} disabled={!!actionLoading} className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50">Restore</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
