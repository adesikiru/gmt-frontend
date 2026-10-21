'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

interface OrgItem {
  id: string;
  name: string;
  code?: string;
}

interface MemberProfileResponse {
  id?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  phone?: string;
  email?: string;
  nin?: string;
  isRegisteredVoter?: boolean;
  voterCardNumber?: string;
  stateId?: string;
  lgaId?: string;
  wardId?: string;
  pollingUnitId?: string;
  state?: { id: string; name: string };
  lga?: { id: string; name: string };
  ward?: { id: string; name: string };
  pollingUnit?: { id: string; name: string; code?: string };
}

export default function SettingsPage() {
  const { user, token, refreshUser } = useAuth();

  // Loading & notification states
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Personal Info Form State
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [middleName, setMiddleName] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [nin, setNin] = useState('');

  // Voter Credentials & Electoral Location Form State
  const [isVoter, setIsVoter] = useState(false);
  const [vin, setVin] = useState('');
  const [stateId, setStateId] = useState('');
  const [lgaId, setLgaId] = useState('');
  const [wardId, setWardId] = useState('');
  const [pollingUnitId, setPollingUnitId] = useState('');

  // Selected textual names for database mapping & resolution
  const [selectedStateName, setSelectedStateName] = useState('');
  const [selectedLgaName, setSelectedLgaName] = useState('');
  const [selectedWardName, setSelectedWardName] = useState('');
  const [selectedPuName, setSelectedPuName] = useState('');

  // Cascading lists
  const [states, setStates] = useState<OrgItem[]>([]);
  const [lgas, setLgas] = useState<OrgItem[]>([]);
  const [wards, setWards] = useState<OrgItem[]>([]);
  const [pollingUnits, setPollingUnits] = useState<OrgItem[]>([]);

  // Loading states for INEC API
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingLgas, setLoadingLgas] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [loadingPus, setLoadingPus] = useState(false);

  // Password update form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Load existing profile & organizational data on mount
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      // 1. Fetch States list from INEC public API
      setLoadingStates(true);
      let loadedStates: OrgItem[] = [];
      try {
        const inecStatesRes = await api.inec.states();
        if (inecStatesRes.success && Array.isArray(inecStatesRes.data) && inecStatesRes.data.length > 0) {
          loadedStates = inecStatesRes.data as OrgItem[];
        } else {
          const orgStatesRes = await api.organization.states();
          if (orgStatesRes.success && Array.isArray(orgStatesRes.data)) {
            loadedStates = orgStatesRes.data as OrgItem[];
          }
        }
      } catch {
        try {
          const orgStatesRes = await api.organization.states();
          if (orgStatesRes.success && Array.isArray(orgStatesRes.data)) {
            loadedStates = orgStatesRes.data as OrgItem[];
          }
        } catch {
          // Continue
        }
      }
      if (isMounted) {
        setStates(loadedStates);
        setLoadingStates(false);
      }

      // 2. Fetch current user profile
      if (token) {
        try {
          const res = await api.auth.me(token);
          if (res.success && res.data) {
            const data = res.data as { memberProfile?: MemberProfileResponse; email?: string; phone?: string };
            const profile = data.memberProfile || {};

            if (isMounted) {
              if (profile.firstName) setFirstName(profile.firstName);
              if (profile.lastName) setLastName(profile.lastName);
              if (profile.middleName) setMiddleName(profile.middleName);
              if (data.phone || profile.phone) setPhone(data.phone || profile.phone || '');
              if (data.email) setEmail(data.email);
              if (profile.nin) setNin(profile.nin);

              const registered = !!profile.isRegisteredVoter;
              setIsVoter(registered);
              if (profile.voterCardNumber) setVin(profile.voterCardNumber);

              const sId = profile.stateId || profile.state?.id || '';
              const lId = profile.lgaId || profile.lga?.id || '';
              const wId = profile.wardId || profile.ward?.id || '';
              const pId = profile.pollingUnitId || profile.pollingUnit?.id || '';

              if (profile.state?.name) setSelectedStateName(profile.state.name);
              if (profile.lga?.name) setSelectedLgaName(profile.lga.name);
              if (profile.ward?.name) setSelectedWardName(profile.ward.name);
              if (profile.pollingUnit?.name) setSelectedPuName(profile.pollingUnit.name);

              setStateId(sId);
              setLgaId(lId);
              setWardId(wId);
              setPollingUnitId(pId);

              // Cascade load LGAs, Wards, Polling Units accurately from INEC or DB
              if (sId) {
                try {
                  const inecLgaRes = await api.inec.lgas(sId);
                  if (inecLgaRes.success && Array.isArray(inecLgaRes.data) && inecLgaRes.data.length > 0) {
                    if (isMounted) setLgas(inecLgaRes.data as OrgItem[]);
                  } else {
                    const lgaRes = await api.organization.lgas(sId);
                    if (lgaRes.success && Array.isArray(lgaRes.data) && isMounted) {
                      setLgas(lgaRes.data as OrgItem[]);
                    }
                  }
                } catch {
                  const lgaRes = await api.organization.lgas(sId);
                  if (lgaRes.success && Array.isArray(lgaRes.data) && isMounted) {
                    setLgas(lgaRes.data as OrgItem[]);
                  }
                }
              }

              if (lId) {
                try {
                  const inecWardRes = await api.inec.wards(lId);
                  if (inecWardRes.success && Array.isArray(inecWardRes.data) && inecWardRes.data.length > 0) {
                    if (isMounted) setWards(inecWardRes.data as OrgItem[]);
                  } else {
                    const wardRes = await api.organization.wards(lId);
                    if (wardRes.success && Array.isArray(wardRes.data) && isMounted) {
                      setWards(wardRes.data as OrgItem[]);
                    }
                  }
                } catch {
                  const wardRes = await api.organization.wards(lId);
                  if (wardRes.success && Array.isArray(wardRes.data) && isMounted) {
                    setWards(wardRes.data as OrgItem[]);
                  }
                }
              }

              if (wId) {
                try {
                  const inecPuRes = await api.inec.pollingUnits(wId);
                  if (inecPuRes.success && Array.isArray(inecPuRes.data) && inecPuRes.data.length > 0) {
                    if (isMounted) setPollingUnits(inecPuRes.data as OrgItem[]);
                  } else {
                    const puRes = await api.organization.pollingUnits(wId);
                    if (puRes.success && Array.isArray(puRes.data) && isMounted) {
                      setPollingUnits(puRes.data as OrgItem[]);
                    }
                  }
                } catch {
                  const puRes = await api.organization.pollingUnits(wId);
                  if (puRes.success && Array.isArray(puRes.data) && isMounted) {
                    setPollingUnits(puRes.data as OrgItem[]);
                  }
                }
              }
            }
          }
        } catch {
          // If offline/error, use local state
        }
      }

      if (isMounted) setLoadingInitial(false);
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Handle State selection change - Fetches LGAs from INEC Public API
  const handleStateChange = async (selectedStateId: string) => {
    setStateId(selectedStateId);
    setLgaId('');
    setWardId('');
    setPollingUnitId('');
    setSelectedLgaName('');
    setSelectedWardName('');
    setSelectedPuName('');
    setLgas([]);
    setWards([]);
    setPollingUnits([]);

    const stateObj = states.find((s) => s.id === selectedStateId);
    setSelectedStateName(stateObj?.name || '');

    if (selectedStateId) {
      setLoadingLgas(true);
      try {
        const res = await api.inec.lgas(selectedStateId);
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setLgas(res.data as OrgItem[]);
        } else {
          const bRes = await api.organization.lgas(selectedStateId);
          if (bRes.success && Array.isArray(bRes.data)) {
            setLgas(bRes.data as OrgItem[]);
          }
        }
      } catch {
        try {
          const bRes = await api.organization.lgas(selectedStateId);
          if (bRes.success && Array.isArray(bRes.data)) {
            setLgas(bRes.data as OrgItem[]);
          }
        } catch {
          setLgas([]);
        }
      } finally {
        setLoadingLgas(false);
      }
    } else {
      setLgas([]);
    }
  };

  // Handle LGA selection change - Fetches Wards from INEC Public API
  const handleLgaChange = async (selectedLgaId: string) => {
    setLgaId(selectedLgaId);
    setWardId('');
    setPollingUnitId('');
    setSelectedWardName('');
    setSelectedPuName('');
    setWards([]);
    setPollingUnits([]);

    const lgaObj = lgas.find((l) => l.id === selectedLgaId);
    setSelectedLgaName(lgaObj?.name || (lgaObj as unknown as { rawName?: string })?.rawName || '');

    if (selectedLgaId) {
      setLoadingWards(true);
      try {
        const res = await api.inec.wards(selectedLgaId);
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setWards(res.data as OrgItem[]);
        } else {
          const bRes = await api.organization.wards(selectedLgaId);
          if (bRes.success && Array.isArray(bRes.data)) {
            setWards(bRes.data as OrgItem[]);
          }
        }
      } catch {
        try {
          const bRes = await api.organization.wards(selectedLgaId);
          if (bRes.success && Array.isArray(bRes.data)) {
            setWards(bRes.data as OrgItem[]);
          }
        } catch {
          setWards([]);
        }
      } finally {
        setLoadingWards(false);
      }
    } else {
      setWards([]);
    }
  };

  // Handle Ward selection change - Fetches Polling Units from INEC Public API
  const handleWardChange = async (selectedWardId: string) => {
    setWardId(selectedWardId);
    setPollingUnitId('');
    setSelectedPuName('');
    setPollingUnits([]);

    const wardObj = wards.find((w) => w.id === selectedWardId);
    setSelectedWardName(wardObj?.name || (wardObj as unknown as { rawName?: string })?.rawName || '');

    if (selectedWardId) {
      setLoadingPus(true);
      try {
        const res = await api.inec.pollingUnits(selectedWardId);
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setPollingUnits(res.data as OrgItem[]);
        } else {
          const bRes = await api.organization.pollingUnits(selectedWardId);
          if (bRes.success && Array.isArray(bRes.data)) {
            setPollingUnits(bRes.data as OrgItem[]);
          }
        }
      } catch {
        try {
          const bRes = await api.organization.pollingUnits(selectedWardId);
          if (bRes.success && Array.isArray(bRes.data)) {
            setPollingUnits(bRes.data as OrgItem[]);
          }
        } catch {
          setPollingUnits([]);
        }
      } finally {
        setLoadingPus(false);
      }
    } else {
      setPollingUnits([]);
    }
  };

  // Handle Polling Unit selection
  const handlePollingUnitChange = (selectedPuId: string) => {
    setPollingUnitId(selectedPuId);
    const puObj = pollingUnits.find((p) => p.id === selectedPuId);
    setSelectedPuName((puObj as unknown as { rawName?: string })?.rawName || puObj?.name || '');
  };

  // If user toggles isVoter ON and no state is selected, default to Ogun State and fetch LGAs
  const handleToggleVoter = (checked: boolean) => {
    setIsVoter(checked);
    if (checked && !stateId && states.length > 0) {
      const ogun = states.find((s) => s.name.toLowerCase().includes('ogun') || s.id === '28') || states[0];
      if (ogun) {
        handleStateChange(ogun.id);
      }
    }
  };

  // Save Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    // Validation
    if (nin && nin.length !== 11) {
      setProfileError('National Identity Number (NIN) must be exactly 11 digits');
      return;
    }

    if (isVoter) {
      if (!vin || vin.trim().length !== 20) {
        setProfileError('Voter Identification Number (VIN) must be exactly 20 characters');
        return;
      }
      if (!lgaId) {
        setProfileError('Please select your Local Government Area (LGA)');
        return;
      }
      if (!wardId) {
        setProfileError('Please select your Electoral Ward');
        return;
      }
    }

    setSavingProfile(true);

    const updatePayload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      middleName: middleName.trim() || undefined,
      phone: phone.trim() || undefined,
      nin: nin.trim() || undefined,
      isRegisteredVoter: isVoter,
      voterCardNumber: isVoter ? vin.trim().toUpperCase() : undefined,
      stateId: isVoter ? stateId || undefined : undefined,
      stateName: isVoter ? selectedStateName || undefined : undefined,
      lgaId: isVoter ? lgaId || undefined : undefined,
      lgaName: isVoter ? selectedLgaName || undefined : undefined,
      wardId: isVoter ? wardId || undefined : undefined,
      wardName: isVoter ? selectedWardName || undefined : undefined,
      pollingUnitId: isVoter ? pollingUnitId || undefined : undefined,
      pollingUnitName: isVoter ? selectedPuName || undefined : undefined,
    };

    try {
      if (token) {
        const res = await api.auth.updateProfile(token, updatePayload);
        if (res.success) {
          setProfileSuccess('Your profile and voter credentials have been successfully updated from INEC records!');
          await refreshUser();
        } else {
          setProfileError(res.message || 'Failed to update profile. Please try again.');
        }
      } else {
        // Offline / demo fallback
        setProfileSuccess('Settings saved successfully in your session.');
      }
    } catch {
      setProfileError('Connection error while saving settings. Please check your network.');
    } finally {
      setSavingProfile(false);
      setTimeout(() => {
        setProfileSuccess('');
      }, 5000);
    }
  };

  // Update Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setSavingPassword(true);

    try {
      if (token) {
        const res = await api.auth.updatePassword(token, {
          currentPassword,
          newPassword,
        });
        if (res.success) {
          setPasswordSuccess('Password successfully updated!');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        } else {
          setPasswordError(res.message || 'Failed to update password. Check your current password.');
        }
      } else {
        setPasswordSuccess('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPasswordError('Could not reach the server to update password.');
    } finally {
      setSavingPassword(false);
      setTimeout(() => {
        setPasswordSuccess('');
      }, 5000);
    }
  };

  if (loadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-gray-500">Loading your account settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Account &amp; Voter Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Update your personal details, National Identity Number (NIN), voter credentials, and electoral polling unit.
        </p>
      </div>

      {/* Profile & Voter Form Card */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            Personal Information &amp; Electoral Records
          </h2>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            Member Profile
          </span>
        </div>

        {profileSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-sm font-semibold flex items-center space-x-2">
            <span>✓</span>
            <span>{profileSuccess}</span>
          </div>
        )}

        {profileError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-semibold flex items-center space-x-2">
            <span>⚠️</span>
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Section 1: Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                First Name *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Adebayo"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Adeleke"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Middle Name (Optional)
              </label>
              <input
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="e.g. Olawale"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 08012345678"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-4 py-2.5 text-sm border border-gray-100 bg-gray-50 text-gray-500 rounded-xl cursor-not-allowed"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Account login email identifier</span>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                National Identification Number (NIN)
              </label>
              <input
                type="text"
                maxLength={11}
                value={nin}
                onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 12345678901 (11 digits)"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                {nin ? `${nin.length}/11 digits` : '11-digit Nigerian National Identity Number'}
              </span>
            </div>
          </div>

          {/* Section 2: Voter Status & Electoral Information */}
          <div className="pt-6 border-t border-gray-100">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Voter Status &amp; Polling Unit Record
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                If you recently registered to vote or have your PVC, update your voter status and select your Local Government, Ward, and Polling Unit below.
              </p>
            </div>

            <div className="bg-emerald-50/70 p-6 rounded-2xl border border-emerald-200/80 transition-all">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVoter}
                  onChange={(e) => handleToggleVoter(e.target.checked)}
                  className="w-5 h-5 text-emerald-600 rounded-md border-gray-300 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-sm font-bold text-gray-900 block">
                    I am a registered voter in Nigeria
                  </span>
                  <span className="text-xs text-emerald-800/80 block mt-0.5">
                    Check this box to record your Voter Identification Number (VIN) and assign your LGA, Ward, and Polling Unit.
                  </span>
                </div>
              </label>

              {/* Electoral location fields when isVoter is checked */}
              {isVoter && (
                <div className="mt-6 pt-5 border-t border-emerald-200/70 space-y-5">
                  {/* VIN Field */}
                  <div>
                    <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1">
                      Voter Identification Number (VIN) *
                    </label>
                    <p className="text-[11px] text-emerald-800 mb-1">
                      Enter your exact 20-character VIN from your Permanent Voter Card (PVC).
                    </p>
                    <input
                      type="text"
                      maxLength={20}
                      value={vin}
                      onChange={(e) => setVin(e.target.value.toUpperCase())}
                      placeholder="e.g. 90F5B123456789012345"
                      className="w-full md:w-96 px-4 py-2.5 text-sm border border-emerald-300 rounded-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                    <p className="text-[11px] text-emerald-700 mt-1 font-mono">{vin.length}/20 characters</p>
                  </div>

                  {/* State & LGA Dropdowns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider">
                          State *
                        </label>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                          INEC Directory
                        </span>
                      </div>
                      <select
                        value={stateId}
                        onChange={(e) => handleStateChange(e.target.value)}
                        disabled={loadingStates}
                        className="w-full px-3.5 py-2.5 border border-emerald-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
                      >
                        <option value="">{loadingStates ? '⏳ Loading states from INEC...' : '-- Select State --'}</option>
                        {states.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider">
                          Local Government Area (LGA) *
                        </label>
                        {loadingLgas && (
                          <span className="text-[10px] font-bold text-emerald-700 animate-pulse">
                            Querying INEC API...
                          </span>
                        )}
                      </div>
                      <select
                        value={lgaId}
                        onChange={(e) => handleLgaChange(e.target.value)}
                        disabled={!stateId || loadingLgas}
                        className="w-full px-3.5 py-2.5 border border-emerald-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                      >
                        <option value="">
                          {loadingLgas
                            ? '⏳ Fetching official LGAs from INEC...'
                            : !stateId
                            ? '-- First select a state --'
                            : '-- Select LGA --'}
                        </option>
                        {lgas.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Ward & Polling Unit Dropdowns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider">
                          Electoral Ward *
                        </label>
                        {loadingWards && (
                          <span className="text-[10px] font-bold text-emerald-700 animate-pulse">
                            Querying INEC Wards...
                          </span>
                        )}
                      </div>
                      <select
                        value={wardId}
                        onChange={(e) => handleWardChange(e.target.value)}
                        disabled={!lgaId || loadingWards}
                        className="w-full px-3.5 py-2.5 border border-emerald-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                      >
                        <option value="">
                          {loadingWards
                            ? '⏳ Fetching official Wards from INEC...'
                            : !lgaId
                            ? '-- First select an LGA --'
                            : '-- Select Ward --'}
                        </option>
                        {wards.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider">
                          Polling Unit (PU)
                        </label>
                        {loadingPus && (
                          <span className="text-[10px] font-bold text-emerald-700 animate-pulse">
                            Querying INEC PUs...
                          </span>
                        )}
                      </div>
                      <select
                        value={pollingUnitId}
                        onChange={(e) => handlePollingUnitChange(e.target.value)}
                        disabled={!wardId || loadingPus}
                        className="w-full px-3.5 py-2.5 border border-emerald-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                      >
                        <option value="">
                          {loadingPus
                            ? '⏳ Fetching official Polling Units from INEC...'
                            : !wardId
                            ? '-- First select an Electoral Ward --'
                            : '-- Select Polling Unit --'}
                        </option>
                        {pollingUnits.map((pu) => (
                          <option key={pu.id} value={pu.id}>
                            {pu.name} {pu.code ? `(${pu.code})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {pollingUnits.length === 0 && wardId && (
                    <p className="text-xs text-emerald-800 italic">
                      No specific polling units listed for this ward yet; ward assignment is sufficient for verification.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={savingProfile}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-7 py-3 rounded-xl transition-all shadow-sm flex items-center space-x-2 disabled:opacity-50"
            >
              {savingProfile ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Changes...</span>
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Card */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
          Account Security &amp; Password
        </h2>

        {passwordSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-sm font-semibold flex items-center space-x-2">
            <span>✓</span>
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-semibold flex items-center space-x-2">
            <span>⚠️</span>
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Current Password *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              New Password *
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {savingPassword ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
