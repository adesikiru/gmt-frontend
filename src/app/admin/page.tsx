'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import BrandLogo from '@/components/BrandLogo';

interface Member {
  id: string;
  status: string;
  membershipNumber?: string;
  createdAt: string;
  rejectionReason?: string;
  user: { email?: string; phone?: string };
  profile?: {
    firstName?: string;
    lastName?: string;
    nin?: string;
    address?: string;
    state?: { name: string };
    lga?: { name: string };
    ward?: { name: string };
    pollingUnit?: { name: string; code?: string };
    isRegisteredVoter?: boolean;
    voterCardNumber?: string;
  };
}

interface EventItem {
  id: string;
  title: string;
  description: string;
  location?: string;
  startDate: string;
  endDate?: string;
  status: string;
  createdAt?: string;
  rsvpCount?: number;
}

interface EmpowermentItem {
  id: string;
  title: string;
  description: string;
  category: string;
  statOrBudget?: string;
  targetAudience?: string;
  icon?: string;
  status: string;
  createdAt?: string;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  VERIFIED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  REJECTED: 'bg-rose-100 text-rose-800 border-rose-200',
  SUSPENDED: 'bg-orange-100 text-orange-800 border-orange-200',
};

export default function AdminDashboard() {
  const { token, user, loading } = useAuth();
  const router = useRouter();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'members' | 'events' | 'empowerment'>('members');

  // Members state
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Events state
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    category: 'Leadership Summit',
    description: '',
    location: '',
    startDate: '',
    publishNow: true,
  });
  const [creatingEvent, setCreatingEvent] = useState(false);

  // Empowerment state
  const [empowerments, setEmpowerments] = useState<EmpowermentItem[]>([]);
  const [loadingEmpowerments, setLoadingEmpowerments] = useState(true);
  const [showEmpowermentModal, setShowEmpowermentModal] = useState(false);
  const [newEmpowerment, setNewEmpowerment] = useState({
    title: '',
    category: 'Youth & Digital Skills',
    description: '',
    statOrBudget: '',
    targetAudience: 'Ogun State (20 LGAs)',
    icon: '💻',
    publishNow: true,
  });
  const [creatingEmpowerment, setCreatingEmpowerment] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!token) {
        router.push('/login');
      } else if (user && !user.isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [loading, token, user, router]);

  // Fetch Members - Pure real production data from API
  const fetchMembers = useCallback(async () => {
    if (!token) {
      setLoadingMembers(false);
      return;
    }
    setLoadingMembers(true);
    setMembersError(null);
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.membership.list(token, params);
      if (res.success && res.data) {
        const d = res.data as { memberships: Member[] };
        setMembers(d.memberships || []);
      } else {
        setMembersError(res.message ?? 'Failed to load membership records');
      }
    } catch {
      setMembersError('Could not connect to the backend server. Please verify backend is running.');
    }
    setLoadingMembers(false);
  }, [token, statusFilter]);

  // Fetch Events - Pure real production data from API
  const fetchEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const res = await api.events.list();
      if (res.success && Array.isArray(res.data)) {
        setEvents(res.data as EventItem[]);
      } else {
        setEvents([]);
      }
    } catch {
      setEvents([]);
    }
    setLoadingEvents(false);
  }, []);

  // Fetch Empowerments - Pure real production data from API
  const fetchEmpowerments = useCallback(async () => {
    setLoadingEmpowerments(true);
    try {
      const res = await api.empowerments.list();
      if (res.success && Array.isArray(res.data)) {
        setEmpowerments(res.data as EmpowermentItem[]);
      } else {
        setEmpowerments([]);
      }
    } catch {
      setEmpowerments([]);
    }
    setLoadingEmpowerments(false);
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetchEmpowerments();
  }, [fetchEmpowerments]);

  // Admin Update Member Status
  const handleAction = async (action: 'verify' | 'reject' | 'suspend' | 'restore', id: string) => {
    setActionLoading(id + action);
    let reason: string | undefined;

    if (action === 'reject' || action === 'suspend') {
      const promptText = action === 'reject'
        ? 'Please enter the reason for rejecting this application:'
        : 'Please enter the reason for suspending this membership:';
      const input = prompt(promptText);
      if (input === null) {
        setActionLoading(null);
        return;
      }
      reason = input || 'Administrative decision';
    }

    try {
      if (token) {
        if (action === 'verify' || action === 'restore') {
          await api.membership.verify(token, id);
        } else if (action === 'reject') {
          await api.membership.reject(token, id, reason);
        } else if (action === 'suspend') {
          await api.membership.suspend(token, id, reason);
        }
        await fetchMembers();
      }
    } catch (err) {
      console.error(err);
      alert('Error updating member status.');
    }
    setActionLoading(null);
  };

  // Create Event
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.startDate) return;
    setCreatingEvent(true);

    try {
      if (token) {
        const res = await api.events.create(token, {
          title: newEvent.title,
          description: newEvent.description,
          location: newEvent.location,
          startDate: new Date(newEvent.startDate).toISOString(),
          status: newEvent.publishNow ? 'PUBLISHED' : 'DRAFT',
        });
        if (res.success) {
          setShowEventModal(false);
          setNewEvent({
            title: '',
            category: 'Leadership Summit',
            description: '',
            location: '',
            startDate: '',
            publishNow: true,
          });
          await fetchEvents();
          alert('Event created successfully!');
        } else {
          alert(res.message || 'Failed to create event');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create event. Please check backend connection.');
    }
    setCreatingEvent(false);
  };

  // Delete Event
  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      if (token) {
        await api.events.delete(token, id);
        await fetchEvents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Empowerment Program
  const handleCreateEmpowerment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpowerment.title || !newEmpowerment.description) return;
    setCreatingEmpowerment(true);

    try {
      if (token) {
        const res = await api.empowerments.create(token, {
          title: newEmpowerment.title,
          description: newEmpowerment.description,
          category: newEmpowerment.category,
          statOrBudget: newEmpowerment.statOrBudget,
          targetAudience: newEmpowerment.targetAudience,
          icon: newEmpowerment.icon,
          status: newEmpowerment.publishNow ? 'PUBLISHED' : 'DRAFT',
        });
        if (res.success) {
          setShowEmpowermentModal(false);
          setNewEmpowerment({
            title: '',
            category: 'Youth & Digital Skills',
            description: '',
            statOrBudget: '',
            targetAudience: 'Ogun State (20 LGAs)',
            icon: '💻',
            publishNow: true,
          });
          await fetchEmpowerments();
          alert('Empowerment initiative created successfully!');
        } else {
          alert(res.message || 'Failed to create empowerment initiative');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create empowerment initiative. Please check backend connection.');
    }
    setCreatingEmpowerment(false);
  };

  // Delete Empowerment Program
  const handleDeleteEmpowerment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this empowerment initiative?')) return;
    try {
      if (token) {
        await api.empowerments.delete(token, id);
        await fetchEmpowerments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered members by search query and status
  const filteredMembers = members.filter((m) => {
    const fullName = `${m.profile?.firstName ?? ''} ${m.profile?.lastName ?? ''}`.toLowerCase();
    const email = (m.user.email ?? '').toLowerCase();
    const phone = m.user.phone ?? '';
    const memNo = (m.membershipNumber ?? '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || fullName.includes(q) || email.includes(q) || phone.includes(q) || memNo.includes(q);
    const matchesStatus = !statusFilter || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <BrandLogo size="sm" showSubtitle={true} href="/admin" />
            <div className="hidden md:flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Super Administrator Console</span>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-emerald-700 font-semibold px-3 py-2 rounded-lg transition-colors"
            >
              Member Portal
            </Link>
            <Link
              href="/"
              className="text-gray-600 hover:text-emerald-700 font-semibold px-3 py-2 rounded-lg transition-colors"
            >
              Public Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'members'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>👥 Members & Applications</span>
              <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-white/20">
                {members.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'events'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>📅 Upcoming Events</span>
              <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-white/20">
                {events.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('empowerment')}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'empowerment'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>🎁 Empowerment Programs</span>
              <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-white/20">
                {empowerments.length}
              </span>
            </button>
          </div>

          {activeTab === 'events' && (
            <button
              onClick={() => setShowEventModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm hover:shadow-emerald-200 shadow-emerald-100 flex items-center space-x-2 transition-all hover:-translate-y-0.5"
            >
              <span>＋ Create New Event</span>
            </button>
          )}

          {activeTab === 'empowerment' && (
            <button
              onClick={() => setShowEmpowermentModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm hover:shadow-emerald-200 shadow-emerald-100 flex items-center space-x-2 transition-all hover:-translate-y-0.5"
            >
              <span>＋ Create Empowerment Program</span>
            </button>
          )}
        </div>

        {/* TAB 1: MEMBERS */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Members', value: members.length, color: 'text-gray-900', bg: 'bg-white' },
                {
                  label: 'Pending Review',
                  value: members.filter((m) => m.status === 'PENDING').length,
                  color: 'text-amber-600',
                  bg: 'bg-amber-50/50',
                },
                {
                  label: 'Verified Members',
                  value: members.filter((m) => m.status === 'VERIFIED').length,
                  color: 'text-emerald-600',
                  bg: 'bg-emerald-50/50',
                },
                {
                  label: 'Suspended / Rejected',
                  value: members.filter((m) => ['REJECTED', 'SUSPENDED'].includes(m.status)).length,
                  color: 'text-rose-600',
                  bg: 'bg-rose-50/50',
                },
              ].map((stat) => (
                <div key={stat.label} className={`${stat.bg} rounded-2xl border border-gray-100 p-5 shadow-sm`}>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{stat.label}</p>
                  <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  placeholder="Search by name, email, phone, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-400"
                />
                <span className="absolute left-3.5 top-3 text-gray-400">🔍</span>
              </div>

              <div className="flex items-center space-x-3 w-full md:w-auto">
                <label className="text-xs font-bold text-gray-500 whitespace-nowrap">Filter Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            {/* Error Message if any */}
            {membersError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center text-red-700 text-sm font-semibold">
                <p>{membersError}</p>
                <p className="text-xs font-normal text-red-500 mt-1">
                  Ensure the backend server is running and you have administrator privileges.
                </p>
              </div>
            )}

            {/* Members Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-black text-gray-900">Registered Grassroots Members</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Click actions to verify, suspend, or reject members. Use &quot;View Details&quot; to inspect voter data.
                  </p>
                </div>
                <button
                  onClick={fetchMembers}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-bold px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors"
                >
                  ↻ Refresh
                </button>
              </div>

              {loadingMembers ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center py-20 text-gray-400 px-4">
                  <div className="text-3xl mb-2">📋</div>
                  <p className="text-base font-bold text-gray-600">No registered members found.</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                    When citizens register through the platform, their applications will appear here for review and verification.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                      <tr>
                        <th className="text-left px-6 py-3.5">Member Details</th>
                        <th className="text-left px-6 py-3.5">Contact</th>
                        <th className="text-left px-6 py-3.5">Ward / LGA</th>
                        <th className="text-left px-6 py-3.5">Voter Card</th>
                        <th className="text-left px-6 py-3.5">Status</th>
                        <th className="text-left px-6 py-3.5">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredMembers.map((m) => (
                        <tr key={m.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">
                              {m.profile?.firstName} {m.profile?.lastName}
                            </div>
                            {m.membershipNumber ? (
                              <div className="text-xs text-emerald-600 font-mono font-bold mt-0.5">
                                {m.membershipNumber}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400">No ID assigned yet</div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-600">
                            <div className="font-medium text-gray-800">{m.user.email}</div>
                            <div className="text-gray-500">{m.user.phone}</div>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-600">
                            <div className="font-bold text-gray-800">{m.profile?.lga?.name ?? 'Not Specified'}</div>
                            <div className="text-gray-500">Ward: {m.profile?.ward?.name ?? 'Not Specified'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-full inline-flex items-center space-x-1 ${
                                m.profile?.isRegisteredVoter
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              <span>{m.profile?.isRegisteredVoter ? '✓ Registered' : 'Not Reg.'}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                                statusColors[m.status] ?? 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {m.status}
                            </span>
                            {m.rejectionReason && (
                              <p className="text-[11px] text-rose-600 mt-1 max-w-[150px] truncate" title={m.rejectionReason}>
                                {m.rejectionReason}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              {/* View Details */}
                              <button
                                onClick={() => setSelectedMember(m)}
                                className="text-xs font-bold text-gray-600 hover:text-emerald-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
                              >
                                View
                              </button>

                              {/* Action buttons depending on status */}
                              {m.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => handleAction('verify', m.id)}
                                    disabled={!!actionLoading}
                                    className="text-xs font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                                  >
                                    Verify
                                  </button>
                                  <button
                                    onClick={() => handleAction('reject', m.id)}
                                    disabled={!!actionLoading}
                                    className="text-xs font-bold bg-rose-600 text-white px-3 py-1.5 rounded-lg hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {m.status === 'VERIFIED' && (
                                <button
                                  onClick={() => handleAction('suspend', m.id)}
                                  disabled={!!actionLoading}
                                  className="text-xs font-bold bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-50"
                                >
                                  Suspend
                                </button>
                              )}

                              {(m.status === 'SUSPENDED' || m.status === 'REJECTED') && (
                                <button
                                  onClick={() => handleAction('restore', m.id)}
                                  disabled={!!actionLoading}
                                  className="text-xs font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                                >
                                  Restore
                                </button>
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
          </div>
        )}

        {/* TAB 2: EVENTS */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black text-gray-900">Upcoming GMT Events & Congresses</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Manage events shown on the public landing page and member portal.
                </p>
              </div>
              <button
                onClick={() => setShowEventModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                ＋ Add Event
              </button>
            </div>

            {loadingEvents ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
              </div>
            ) : events.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center text-gray-400 space-y-2">
                <div className="text-3xl">📅</div>
                <h3 className="font-bold text-gray-700 text-base">No upcoming events scheduled at this time.</h3>
                <p className="text-xs text-gray-400">
                  Click &quot;Add Event&quot; above to create official rallies, summits, and ward meetings.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {ev.status}
                        </span>
                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="text-gray-400 hover:text-rose-600 text-xs font-bold transition-colors"
                        >
                          ✕ Delete
                        </button>
                      </div>
                      <h3 className="text-lg font-black text-gray-900">{ev.title}</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">{ev.description}</p>
                      <div className="space-y-1.5 pt-2 text-xs text-gray-500">
                        <div>
                          📍 <strong className="text-gray-700">{ev.location ?? 'Venue TBA'}</strong>
                        </div>
                        <div>
                          📅{' '}
                          <strong className="text-gray-700">
                            {new Date(ev.startDate).toLocaleDateString('en-NG', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </strong>
                        </div>
                        {ev.rsvpCount !== undefined && (
                          <div className="text-emerald-700 font-bold pt-1">
                            👥 {ev.rsvpCount} Attending
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: EMPOWERMENT */}
        {activeTab === 'empowerment' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black text-gray-900">Grassroots Empowerment Initiatives</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Create and manage community empowerment schemes displayed on the platform.
                </p>
              </div>
              <button
                onClick={() => setShowEmpowermentModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                ＋ Add Initiative
              </button>
            </div>

            {loadingEmpowerments ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
              </div>
            ) : empowerments.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center text-gray-400 space-y-2">
                <div className="text-3xl">🎁</div>
                <h3 className="font-bold text-gray-700 text-base">No empowerment initiatives created yet.</h3>
                <p className="text-xs text-gray-400">
                  Click &quot;Add Initiative&quot; above to create tech grants, farming subsidies, or SME support funds.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {empowerments.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="text-3xl p-2 bg-emerald-50 rounded-2xl inline-block">
                          {item.icon || '🤝'}
                        </div>
                        <button
                          onClick={() => handleDeleteEmpowerment(item.id)}
                          className="text-gray-400 hover:text-rose-600 text-xs font-bold transition-colors"
                        >
                          ✕ Delete
                        </button>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                          {item.category}
                        </span>
                        <h3 className="text-base font-black text-gray-900 mt-0.5">{item.title}</h3>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 mt-4 space-y-1 text-xs text-gray-500">
                      {item.statOrBudget && (
                        <div className="font-bold text-emerald-700">
                          💰 {item.statOrBudget}
                        </div>
                      )}
                      {item.targetAudience && (
                        <div className="text-gray-600">
                          📍 {item.targetAudience}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MEMBER DETAILS MODAL */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-gray-900">
                  {selectedMember.profile?.firstName} {selectedMember.profile?.lastName}
                </h3>
                <p className="text-xs text-gray-500">
                  Membership ID: {selectedMember.membershipNumber ?? 'Pending Generation'}
                </p>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-gray-50 p-3 rounded-xl space-y-1">
                <span className="text-gray-400 font-bold uppercase">Email</span>
                <p className="font-semibold text-gray-800">{selectedMember.user.email}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl space-y-1">
                <span className="text-gray-400 font-bold uppercase">Phone</span>
                <p className="font-semibold text-gray-800">{selectedMember.user.phone}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl space-y-1">
                <span className="text-gray-400 font-bold uppercase">NIN (11 Digits)</span>
                <p className="font-mono font-bold text-gray-800">{selectedMember.profile?.nin ?? 'Not Provided'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl space-y-1">
                <span className="text-gray-400 font-bold uppercase">Voter Card VIN</span>
                <p className="font-mono font-bold text-gray-800">{selectedMember.profile?.voterCardNumber ?? 'Not Provided'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl space-y-1 col-span-2">
                <span className="text-gray-400 font-bold uppercase">Residential Address</span>
                <p className="font-medium text-gray-800">{selectedMember.profile?.address ?? 'Not Provided'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl space-y-1">
                <span className="text-gray-400 font-bold uppercase">LGA & Ward</span>
                <p className="font-semibold text-gray-800">
                  {selectedMember.profile?.lga?.name ?? 'N/A'} / {selectedMember.profile?.ward?.name ?? 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl space-y-1">
                <span className="text-gray-400 font-bold uppercase">Polling Unit</span>
                <p className="font-semibold text-gray-800">
                  {selectedMember.profile?.pollingUnit?.name ?? 'Not Assigned'}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setSelectedMember(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-5 py-2.5 rounded-xl transition-colors"
              >
                Close
              </button>
              {selectedMember.status === 'PENDING' && (
                <button
                  onClick={() => {
                    handleAction('verify', selectedMember.id);
                    setSelectedMember(null);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  Verify Application
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative space-y-5">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-gray-900">Create Upcoming Event</h3>
                <p className="text-xs text-gray-500">Publish a new meeting, summit, or empowerment drive</p>
              </div>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-gray-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ogun State Youth Tech & Empowerment Congress"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-normal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1">Category</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-white"
                  >
                    <option value="Leadership Summit">Leadership Summit</option>
                    <option value="Training">Training Workshop</option>
                    <option value="Empowerment">Empowerment</option>
                    <option value="Townhall">Ward Townhall</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-normal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Venue / Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. June 12 Cultural Centre, Kuto, Abeokuta"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-normal"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the agenda, who should attend, and expected objectives..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-normal"
                ></textarea>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="publishNow"
                  checked={newEvent.publishNow}
                  onChange={(e) => setNewEvent({ ...newEvent, publishNow: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="publishNow" className="text-gray-700 text-xs font-bold cursor-pointer">
                  Publish immediately to Public and Member portal
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingEvent}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                >
                  {creatingEvent ? 'Creating...' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE EMPOWERMENT MODAL */}
      {showEmpowermentModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative space-y-5">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-gray-900">Create Empowerment Initiative</h3>
                <p className="text-xs text-gray-500">Publish a new program or grant scheme for grassroots members</p>
              </div>
              <button
                onClick={() => setShowEmpowermentModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEmpowerment} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-gray-700 mb-1">Initiative Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grassroots Youth Tech & Laptop Scholarship"
                  value={newEmpowerment.title}
                  onChange={(e) => setNewEmpowerment({ ...newEmpowerment, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-normal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1">Category</label>
                  <select
                    value={newEmpowerment.category}
                    onChange={(e) => setNewEmpowerment({ ...newEmpowerment, category: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-white"
                  >
                    <option value="Youth & Digital Skills">Youth & Digital Skills</option>
                    <option value="Market Traders & SME">Market Traders & SME</option>
                    <option value="Agriculture & Farmers">Agriculture & Farmers</option>
                    <option value="Community Healthcare">Community Healthcare</option>
                    <option value="Women Empowerment">Women Empowerment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Icon / Symbol</label>
                  <select
                    value={newEmpowerment.icon}
                    onChange={(e) => setNewEmpowerment({ ...newEmpowerment, icon: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-white"
                  >
                    <option value="💻">💻 Laptop / Tech</option>
                    <option value="🏪">🏪 Shop / SME Market</option>
                    <option value="🌾">🌾 Farm / Agriculture</option>
                    <option value="🩺">🩺 Health / Medical</option>
                    <option value="🎓">🎓 Education / Grant</option>
                    <option value="🤝">🤝 Cooperative</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1">Key Stat / Budget</label>
                  <input
                    type="text"
                    placeholder="e.g. ₦50M Micro-Fund or 2,000 Beneficiaries"
                    value={newEmpowerment.statOrBudget}
                    onChange={(e) => setNewEmpowerment({ ...newEmpowerment, statOrBudget: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-normal"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Target Coverage</label>
                  <input
                    type="text"
                    placeholder="e.g. 20 LGAs in Ogun State"
                    value={newEmpowerment.targetAudience}
                    onChange={(e) => setNewEmpowerment({ ...newEmpowerment, targetAudience: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-normal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail what beneficiaries receive, eligibility criteria, and application procedure..."
                  value={newEmpowerment.description}
                  onChange={(e) => setNewEmpowerment({ ...newEmpowerment, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-normal"
                ></textarea>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="publishEmpowermentNow"
                  checked={newEmpowerment.publishNow}
                  onChange={(e) => setNewEmpowerment({ ...newEmpowerment, publishNow: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="publishEmpowermentNow" className="text-gray-700 text-xs font-bold cursor-pointer">
                  Publish immediately to public landing page
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEmpowermentModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingEmpowerment}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                >
                  {creatingEmpowerment ? 'Creating...' : 'Publish Initiative'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
