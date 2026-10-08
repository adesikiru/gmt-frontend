'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

interface Membership {
  status: string;
  membershipNumber?: string;
  createdAt: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    nin?: string;
    state?: { name: string };
    lga?: { name: string };
    ward?: { name: string };
    pollingUnit?: { name: string; code?: string };
    isRegisteredVoter?: boolean;
    voterCardNumber?: string;
  };
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  VERIFIED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
  SUSPENDED: 'bg-orange-100 text-orange-800 border-orange-200',
  INACTIVE: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function MemberDashboardOverview() {
  const { user, token, loading } = useAuth();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (token) {
      api.membership.my(token).then((res) => {
        if (res.success) setMembership(res.data as Membership);
        setLoadingData(false);
      });
    } else if (!loading) {
      setLoadingData(false);
    }
  }, [token, loading]);

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 rounded-3xl p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold mb-3 backdrop-blur-xs">
            <span>Official GMT Member Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold mb-2">
            Welcome back, {user?.firstName || 'Member'}! 👋
          </h1>
          <p className="text-emerald-100 text-sm max-w-xl">
            Grassroots Movement for Tinubu — Mobilizing citizens from the polling unit to the national stage.
          </p>
        </div>
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl"></div>
      </div>

      {/* Membership Credential Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Membership Credentials</h2>
            <p className="text-xs text-gray-500 mt-1">Official Grassroots Movement Identification</p>
          </div>
          <span
            className={`self-start sm:self-center text-xs font-extrabold px-3 py-1.5 rounded-full border ${
              statusColors[membership?.status || 'PENDING']
            }`}
          >
            ● Status: {membership?.status || 'PENDING'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Membership Number</label>
              <div className="font-mono font-bold text-emerald-700 text-lg mt-0.5">
                {membership?.membershipNumber || 'Pending Verification'}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Full Name</label>
              <div className="font-semibold text-gray-800 text-base mt-0.5">
                {user?.firstName} {user?.lastName}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Contact Information</label>
              <div className="text-sm text-gray-700 mt-0.5">
                <div>Email: {user?.email || 'N/A'}</div>
                <div>Phone: {user?.phone || 'N/A'}</div>
              </div>
            </div>

            {membership?.profile?.nin && (
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">NIN (National ID)</label>
                <div className="font-mono text-sm text-gray-800 mt-0.5">
                  •••••••{membership.profile.nin.slice(-4)}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100/70">
            <h3 className="font-bold text-emerald-900 text-sm">Electoral & Location Record</h3>

            <div>
              <label className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">Voter Status</label>
              <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-md mt-1 ${
                membership?.profile?.isRegisteredVoter ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {membership?.profile?.isRegisteredVoter ? '✓ Registered Voter' : 'General Supporter / Non-Voter'}
              </span>
            </div>

            {membership?.profile?.isRegisteredVoter && (
              <>
                {membership.profile.voterCardNumber && (
                  <div>
                    <label className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">VIN (Voter Card Number)</label>
                    <div className="font-mono text-xs font-bold text-gray-800 mt-0.5 tracking-wider">
                      {membership.profile.voterCardNumber}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-emerald-700 uppercase tracking-wider block">State / LGA</label>
                    <div className="font-medium text-gray-800 mt-0.5">
                      {membership.profile.state?.name || 'Ogun'} &bull; {membership.profile.lga?.name || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="font-semibold text-emerald-700 uppercase tracking-wider block">Ward</label>
                    <div className="font-medium text-gray-800 mt-0.5">
                      {membership.profile.ward?.name || 'N/A'}
                    </div>
                  </div>
                </div>

                {membership.profile.pollingUnit && (
                  <div>
                    <label className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">Polling Unit</label>
                    <div className="text-xs font-medium text-gray-800 mt-0.5">
                      {membership.profile.pollingUnit.name} ({membership.profile.pollingUnit.code || 'PU'})
                    </div>
                  </div>
                )}
              </>
            )}

            {!membership?.profile?.isRegisteredVoter && (
              <p className="text-xs text-emerald-800/80 leading-relaxed">
                You are registered as a GMT member. If you become a registered voter, you can update your polling unit anytime in <Link href="/dashboard/settings" className="font-bold underline">Settings</Link>.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/members"
          className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group"
        >
          <div className="text-3xl mb-3">👥</div>
          <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">Directory</h3>
          <p className="text-xs text-gray-500 mt-1">Connect with GMT members and coordinators across your LGA and ward.</p>
        </Link>

        <Link
          href="/dashboard/events"
          className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group"
        >
          <div className="text-3xl mb-3">📅</div>
          <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">Events & Congress</h3>
          <p className="text-xs text-gray-500 mt-1">Explore upcoming state summits, ward assemblies, and leadership workshops.</p>
        </Link>

        <Link
          href="/dashboard/settings"
          className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group"
        >
          <div className="text-3xl mb-3">⚙️</div>
          <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">Account Settings</h3>
          <p className="text-xs text-gray-500 mt-1">Update your personal profile, voter information, NIN, or password.</p>
        </Link>
      </div>
    </div>
  );
}
