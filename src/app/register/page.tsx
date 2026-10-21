'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import BrandLogo from '@/components/BrandLogo';

interface OrgItem {
  id: string;
  name: string;
  code?: string;
  fullName?: string;
  rawName?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      router.push('/dashboard');
    }
  }, [authLoading, isLoggedIn, router]);

  // Form state
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phone: '',
    nin: '',
    password: '',
    confirmPassword: '',
    isRegisteredVoter: false,
    voterCardNumber: '',
    stateId: '',
    lgaId: '',
    wardId: '',
    pollingUnitId: '',
  });

  // Selected names for backend DB mapping
  const [selectedStateName, setSelectedStateName] = useState('Ogun State');
  const [selectedLgaName, setSelectedLgaName] = useState('');
  const [selectedWardName, setSelectedWardName] = useState('');
  const [selectedPuName, setSelectedPuName] = useState('');

  // Organizational cascading lists from INEC
  const [states, setStates] = useState<OrgItem[]>([]);
  const [lgas, setLgas] = useState<OrgItem[]>([]);
  const [wards, setWards] = useState<OrgItem[]>([]);
  const [pollingUnits, setPollingUnits] = useState<OrgItem[]>([]);

  // Loading states for each cascading level
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingLgas, setLoadingLgas] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [loadingPus, setLoadingPus] = useState(false);

  // INEC portal maintenance mode — when true, wards & PUs use free-text inputs
  const [inecMaintenance, setInecMaintenance] = useState(false);
  const [wardText, setWardText] = useState('');
  const [puText, setPuText] = useState('');

  // Load INEC States on mount
  useEffect(() => {
    setLoadingStates(true);
    api.inec
      .states()
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          const stateList = res.data as OrgItem[];
          setStates(stateList);
          // Default to Ogun State (ID 28)
          const ogun = stateList.find(
            (s) => s.id === '28' || s.name.toLowerCase().includes('ogun'),
          );
          if (ogun) {
            setForm((f) => ({ ...f, stateId: ogun.id }));
            setSelectedStateName(ogun.name || 'Ogun State');
          }
        } else {
          // Fallback to backend organization states if INEC route fails
          api.organization.states().then((bRes) => {
            if (bRes.success && bRes.data) {
              const bList = bRes.data as OrgItem[];
              setStates(bList);
              const ogun = bList.find((s) => s.name.toLowerCase().includes('ogun'));
              if (ogun) {
                setForm((f) => ({ ...f, stateId: ogun.id }));
                setSelectedStateName(ogun.name);
              }
            }
          });
        }
      })
      .catch(() => {
        // Fallback to backend organization
        api.organization.states().then((bRes) => {
          if (bRes.success && bRes.data) {
            const bList = bRes.data as OrgItem[];
            setStates(bList);
            const ogun = bList.find((s) => s.name.toLowerCase().includes('ogun'));
            if (ogun) {
              setForm((f) => ({ ...f, stateId: ogun.id }));
              setSelectedStateName(ogun.name);
            }
          }
        });
      })
      .finally(() => setLoadingStates(false));
  }, []);

  // When State changes: fetch INEC LGAs
  useEffect(() => {
    if (form.isRegisteredVoter && form.stateId) {
      setLoadingLgas(true);
      setLgas([]);
      setWards([]);
      setPollingUnits([]);
      setSelectedLgaName('');
      setSelectedWardName('');
      setSelectedPuName('');

      api.inec
        .lgas(form.stateId)
        .then((res) => {
          if (res.success && res.data && res.data.length > 0) {
            setLgas((res.data as OrgItem[]) ?? []);
          } else {
            // Fallback to backend organization LGAs
            api.organization.lgas(form.stateId).then((bRes) => {
              if (bRes.success) setLgas((bRes.data as OrgItem[]) ?? []);
            });
          }
        })
        .catch(() => {
          api.organization.lgas(form.stateId).then((bRes) => {
            if (bRes.success) setLgas((bRes.data as OrgItem[]) ?? []);
          });
        })
        .finally(() => {
          setLoadingLgas(false);
          setForm((f) => ({ ...f, lgaId: '', wardId: '', pollingUnitId: '' }));
        });
    }
  }, [form.stateId, form.isRegisteredVoter]);

  // When LGA changes: fetch INEC Wards
  useEffect(() => {
    if (form.isRegisteredVoter && form.lgaId) {
      setLoadingWards(true);
      setWards([]);
      setPollingUnits([]);
      setSelectedWardName('');
      setSelectedPuName('');
      setWardText('');
      setPuText('');

      api.inec
        .wards(form.lgaId)
        .then((res) => {
          if (res.maintenanceMode) {
            // INEC portal is under maintenance — switch to free-text mode
            setInecMaintenance(true);
          } else if (res.success && res.data && res.data.length > 0) {
            setInecMaintenance(false);
            setWards((res.data as OrgItem[]) ?? []);
          } else {
            // Try backend org wards as last fallback
            api.organization.wards(form.lgaId).then((bRes) => {
              if (bRes.success) setWards((bRes.data as OrgItem[]) ?? []);
              else setInecMaintenance(true);
            });
          }
        })
        .catch(() => {
          api.organization.wards(form.lgaId).then((bRes) => {
            if (bRes.success) setWards((bRes.data as OrgItem[]) ?? []);
            else setInecMaintenance(true);
          });
        })
        .finally(() => {
          setLoadingWards(false);
          setForm((f) => ({ ...f, wardId: '', pollingUnitId: '' }));
        });
    }
  }, [form.lgaId, form.isRegisteredVoter]);

  // When Ward changes: fetch INEC Polling Units
  useEffect(() => {
    if (form.isRegisteredVoter && form.wardId && !inecMaintenance) {
      setLoadingPus(true);
      setPollingUnits([]);
      setSelectedPuName('');
      setPuText('');

      api.inec
        .pollingUnits(form.wardId)
        .then((res) => {
          if (res.maintenanceMode) {
            setInecMaintenance(true);
          } else if (res.success && res.data && res.data.length > 0) {
            setPollingUnits((res.data as OrgItem[]) ?? []);
          } else {
            api.organization.pollingUnits(form.wardId).then((bRes) => {
              if (bRes.success) setPollingUnits((bRes.data as OrgItem[]) ?? []);
            });
          }
        })
        .catch(() => {
          api.organization.pollingUnits(form.wardId).then((bRes) => {
            if (bRes.success) setPollingUnits((bRes.data as OrgItem[]) ?? []);
          });
        })
        .finally(() => {
          setLoadingPus(false);
          setForm((f) => ({ ...f, pollingUnitId: '' }));
        });
    }
  }, [form.wardId, form.isRegisteredVoter, inecMaintenance]);

  const setField = (field: string, value: string | boolean) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleStateChange = (stateId: string) => {
    setField('stateId', stateId);
    const selected = states.find((s) => s.id === stateId);
    setSelectedStateName(selected?.name || selected?.fullName || '');
  };

  const handleLgaChange = (lgaId: string) => {
    setField('lgaId', lgaId);
    const selected = lgas.find((l) => l.id === lgaId);
    setSelectedLgaName(selected?.name || selected?.rawName || '');
  };

  const handleWardChange = (wardId: string) => {
    setField('wardId', wardId);
    const selected = wards.find((w) => w.id === wardId);
    setSelectedWardName(selected?.name || selected?.rawName || '');
  };

  const handleWardTextChange = (text: string) => {
    setWardText(text);
    setSelectedWardName(text);
    // Use the text itself as a pseudo-id so validation passes
    setField('wardId', text ? 'MANUAL' : '');
  };

  const handlePuChange = (puId: string) => {
    setField('pollingUnitId', puId);
    const selected = pollingUnits.find((p) => p.id === puId);
    setSelectedPuName(selected?.rawName || selected?.name || '');
  };

  const handlePuTextChange = (text: string) => {
    setPuText(text);
    setSelectedPuName(text);
    setField('pollingUnitId', text ? 'MANUAL' : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.nin && form.nin.length !== 11) {
      setError('National Identity Number (NIN) must be exactly 11 digits');
      return;
    }

    if (form.isRegisteredVoter) {
      if (!form.voterCardNumber || form.voterCardNumber.length !== 20) {
        setError('Voter Identification Number (VIN) must be exactly 20 characters');
        return;
      }
      if (!form.lgaId || !form.wardId) {
        setError('Please select your LGA and Ward for voter records');
        return;
      }
    }

    setLoading(true);
    const res = await api.auth.register({
      firstName: form.firstName,
      lastName: form.lastName,
      middleName: form.middleName || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
      nin: form.nin || undefined,
      password: form.password,
      isRegisteredVoter: form.isRegisteredVoter,
      voterCardNumber: form.isRegisteredVoter ? form.voterCardNumber : undefined,
      stateId: form.isRegisteredVoter ? form.stateId || undefined : undefined,
      stateName: form.isRegisteredVoter ? selectedStateName || undefined : undefined,
      lgaId: form.isRegisteredVoter ? form.lgaId || undefined : undefined,
      lgaName: form.isRegisteredVoter ? selectedLgaName || undefined : undefined,
      wardId: form.isRegisteredVoter ? form.wardId || undefined : undefined,
      wardName: form.isRegisteredVoter ? selectedWardName || undefined : undefined,
      pollingUnitId: form.isRegisteredVoter ? form.pollingUnitId || undefined : undefined,
      pollingUnitName: form.isRegisteredVoter ? selectedPuName || undefined : undefined,
    });
    setLoading(false);

    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.message ?? 'Registration failed. Please check your information.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center max-w-md">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">Welcome to GMT!</h2>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            Your membership registration has been received. You can now log into your member portal.
          </p>
          <Link
            href="/login"
            className="block w-full bg-emerald-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Sign In to Member Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <BrandLogo size="lg" showSubtitle={true} href="/" />
          <h2 className="text-2xl font-black text-gray-900 mt-6">Join the Movement</h2>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            GMT is open to all citizens across Nigeria — whether registered as a voter or joining as a passionate grassroots supporter.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-10">
          {error && (
            <div className="mb-6 bg-red-50 text-red-700 border border-red-200 rounded-2xl px-4 py-3 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Personal Details */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
                1. Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    First Name *
                  </label>
                  <input
                    required
                    value={form.firstName}
                    onChange={(e) => setField('firstName', e.target.value)}
                    placeholder="e.g. Adebayo"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Last Name *
                  </label>
                  <input
                    required
                    value={form.lastName}
                    onChange={(e) => setField('lastName', e.target.value)}
                    placeholder="e.g. Adeleke"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Middle Name (Optional)
                </label>
                <input
                  value={form.middleName}
                  onChange={(e) => setField('middleName', e.target.value)}
                  placeholder="e.g. Olawale"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    placeholder="08012345678"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              {/* NIN Field */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  National Identification Number (NIN)
                </label>
                <p className="text-[11px] text-gray-400 mb-1">Your 11-digit national identity number for verification.</p>
                <input
                  type="text"
                  maxLength={11}
                  value={form.nin}
                  onChange={(e) => setField('nin', e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 12345678901 (11 digits)"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>

            {/* Section 2: Voter Status Toggle */}
            <div className="pt-2">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
                2. Voter Information & Eligibility
              </h3>
              
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 transition-all">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isRegisteredVoter}
                    onChange={(e) => setField('isRegisteredVoter', e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded-md border-gray-300 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-gray-900 block">
                      I am a registered voter in Nigeria
                    </span>
                    <span className="text-xs text-emerald-800/80 block mt-0.5">
                      Check this box if you have an INEC Permanent Voter Card (PVC). Non-voters can leave unchecked to join as general GMT members.
                    </span>
                  </div>
                </label>

                {/* Organizational Fields: ONLY displayed if user is a registered voter */}
                {form.isRegisteredVoter && (
                  <div className="mt-6 pt-5 border-t border-emerald-200/60 space-y-4">
                    {/* INEC Status Banner */}
                    {inecMaintenance ? (
                      <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex items-start space-x-3">
                        <div className="mt-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                              INEC Directory — Maintenance Mode
                            </span>
                            <span className="text-[10px] font-semibold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                              Offline
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                            The INEC portal (cvr.inecnigeria.org) is currently under maintenance. LGAs are loaded from our static database. Please type your Ward and Polling Unit name manually — your data will be verified once INEC is back online.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-emerald-100/70 border border-emerald-200 rounded-xl p-3.5 flex items-start space-x-3">
                        <div className="mt-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                              INEC Official Voter Directory
                            </span>
                            <span className="text-[10px] font-semibold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                              Live Integration
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                            Cascading directory populated directly from INEC (cvr.inecnigeria.org). Defaulting to Ogun State with support nationwide.
                          </p>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1">
                        Voter Identification Number (VIN) *
                      </label>
                      <p className="text-[11px] text-emerald-800 mb-1">Enter your exact 20-character VIN from your voter card.</p>
                      <input
                        required={form.isRegisteredVoter}
                        maxLength={20}
                        value={form.voterCardNumber}
                        onChange={(e) => setField('voterCardNumber', e.target.value.toUpperCase())}
                        placeholder="e.g. 90F5B123456789012345"
                        className="w-full px-3.5 py-2.5 border border-emerald-300 rounded-xl bg-white font-mono tracking-widest text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <p className="text-[11px] text-emerald-700 mt-1">{form.voterCardNumber.length}/20 characters</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* State Selection */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider">
                            State *
                          </label>
                          {loadingStates && (
                            <span className="text-[10px] text-emerald-700 animate-pulse font-medium">Loading...</span>
                          )}
                        </div>
                        <select
                          value={form.stateId}
                          onChange={(e) => handleStateChange(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-emerald-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="">-- Select State --</option>
                          {states.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} {s.fullName ? `(${s.fullName})` : ''}
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-emerald-700 mt-1">Starting with Ogun State (ID 28)</p>
                      </div>

                      {/* LGA Selection */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider">
                            Local Government Area (LGA) *
                          </label>
                          {loadingLgas && (
                            <span className="text-[10px] text-emerald-700 animate-pulse font-medium">Fetching LGAs...</span>
                          )}
                        </div>
                        <select
                          value={form.lgaId}
                          onChange={(e) => handleLgaChange(e.target.value)}
                          disabled={!form.stateId || loadingLgas}
                          className="w-full px-3.5 py-2.5 border border-emerald-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                        >
                          <option value="">
                            {loadingLgas ? '-- Loading LGAs from INEC... --' : '-- Select LGA --'}
                          </option>
                          {lgas.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.name}
                            </option>
                          ))}
                        </select>
                        {lgas.length > 0 && !loadingLgas && (
                          <p className="text-[10px] text-emerald-700 mt-1">{lgas.length} LGAs loaded from INEC</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Electoral Ward — Dropdown (live) or Text Input (maintenance) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider">
                            Electoral Ward *
                          </label>
                          {loadingWards && (
                            <span className="text-[10px] text-emerald-700 animate-pulse font-medium">Fetching Wards...</span>
                          )}
                        </div>
                        {inecMaintenance ? (
                          <input
                            type="text"
                            value={wardText}
                            onChange={(e) => handleWardTextChange(e.target.value)}
                            placeholder="Type your ward name (e.g. Odeda Ward 1)"
                            disabled={!form.lgaId}
                            className="w-full px-3.5 py-2.5 border border-amber-300 rounded-xl bg-amber-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
                          />
                        ) : (
                          <select
                            value={form.wardId}
                            onChange={(e) => handleWardChange(e.target.value)}
                            disabled={!form.lgaId || loadingWards}
                            className="w-full px-3.5 py-2.5 border border-emerald-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                          >
                            <option value="">
                              {loadingWards ? '-- Loading Wards from INEC... --' : '-- Select Ward --'}
                            </option>
                            {wards.map((w) => (
                              <option key={w.id} value={w.id}>
                                {w.name}
                              </option>
                            ))}
                          </select>
                        )}
                        {wards.length > 0 && !loadingWards && !inecMaintenance && (
                          <p className="text-[10px] text-emerald-700 mt-1">{wards.length} Wards loaded from INEC</p>
                        )}
                        {inecMaintenance && (
                          <p className="text-[10px] text-amber-700 mt-1">Type your ward name — INEC is under maintenance</p>
                        )}
                      </div>

                      {/* Polling Unit — Dropdown (live) or Text Input (maintenance) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider">
                            Polling Unit (PU)
                          </label>
                          {loadingPus && (
                            <span className="text-[10px] text-emerald-700 animate-pulse font-medium">Fetching PUs...</span>
                          )}
                        </div>
                        {inecMaintenance ? (
                          <input
                            type="text"
                            value={puText}
                            onChange={(e) => handlePuTextChange(e.target.value)}
                            placeholder="Type your polling unit name (optional)"
                            disabled={!form.lgaId}
                            className="w-full px-3.5 py-2.5 border border-amber-300 rounded-xl bg-amber-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
                          />
                        ) : (
                          <select
                            value={form.pollingUnitId}
                            onChange={(e) => handlePuChange(e.target.value)}
                            disabled={!form.wardId || loadingPus}
                            className="w-full px-3.5 py-2.5 border border-emerald-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                          >
                            <option value="">
                              {loadingPus ? '-- Loading Polling Units... --' : '-- Select Polling Unit --'}
                            </option>
                            {pollingUnits.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.code ? `[PU ${p.code}] ` : ''}
                                {p.name}
                              </option>
                            ))}
                          </select>
                        )}
                        {inecMaintenance && (
                          <p className="text-[10px] text-amber-700 mt-1">Type your polling unit — INEC is under maintenance</p>
                        )}
                        {pollingUnits.length > 0 && !loadingPus && (
                          <p className="text-[10px] text-emerald-700 mt-1">{pollingUnits.length} Polling Units loaded from INEC</p>
                        )}
                      </div>
                    </div>

                    {/* Verified Voting Station Confirmation Card */}
                    {form.pollingUnitId && selectedPuName && (
                      <div className="mt-4 bg-white border border-emerald-200 rounded-2xl p-4 shadow-sm animate-fadeIn">
                        <div className="flex items-center space-x-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Selected INEC Electoral Station</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="bg-emerald-50/60 p-2 rounded-lg">
                            <span className="text-[10px] text-emerald-700 block font-semibold">State</span>
                            <span className="text-gray-900 font-bold">{selectedStateName || 'Ogun State'}</span>
                          </div>
                          <div className="bg-emerald-50/60 p-2 rounded-lg">
                            <span className="text-[10px] text-emerald-700 block font-semibold">LGA</span>
                            <span className="text-gray-900 font-bold">{selectedLgaName || 'Selected LGA'}</span>
                          </div>
                          <div className="bg-emerald-50/60 p-2 rounded-lg">
                            <span className="text-[10px] text-emerald-700 block font-semibold">Ward</span>
                            <span className="text-gray-900 font-bold truncate block">{selectedWardName || 'Selected Ward'}</span>
                          </div>
                          <div className="bg-emerald-50/60 p-2 rounded-lg">
                            <span className="text-[10px] text-emerald-700 block font-semibold">Polling Unit</span>
                            <span className="text-gray-900 font-bold truncate block">{selectedPuName}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Password */}
            <div className="pt-2">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
                3. Security Credentials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setField('password', e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={form.confirmPassword}
                    onChange={(e) => setField('confirmPassword', e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200 disabled:opacity-60 text-base"
              >
                {loading ? 'Creating Your Account...' : 'Complete GMT Registration'}
              </button>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already a member?{' '}
          <Link href="/login" className="font-bold text-emerald-600 hover:text-emerald-700">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
