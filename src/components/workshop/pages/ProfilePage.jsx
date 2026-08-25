import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { LED, Rivet } from '@/components/primitives/Details';

import {
  mockUser,
  mockSkills,
  mockAchievements,
  mockEarnings,
} from '@/data/workshopMockData';

import {
  mockProfileData,
  mockProfileLinks,
  mockProfileProjects,
  mockProfileCertifications,
  mockProfileStats,
  CATEGORY_COLORS,
} from '@/data/jugaadMockData';

import {
  User,
  Star,
  Wallet,
  Award,
  Briefcase,
  Link2,
  Github,
  Globe,
  Linkedin,
  FileText,
  MapPin,
  TrendingUp,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Code as Codeforces,
  Plus,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';

const LINK_ICONS = {
  LinkedIn: Linkedin,
  GitHub: Github,
  Portfolio: Globe,
  Resume: FileText,
  'Personal Website': Globe,
  Behance: Globe,
  LeetCode: Codeforces,
  CodeChef: Codeforces,
  Codeforces: Codeforces,
  Instagram: Globe,
  Other: Link2,
};

export function ProfilePage() {
  const {
    user: authUser,
    isDemoMode,
    isAuthenticated,
  } = useAuth();

  const [profile, setProfile] = useState(
    isDemoMode
      ? {
          ...mockUser,
          ...mockProfileData,
          ...(authUser || {}),
        }
      : authUser || {}
  );

  const [myJugaads, setMyJugaads] = useState([]);
  const [loading, setLoading] = useState(!isDemoMode);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    number: '',
    location: '',
    college_id: '',
  });

  const [skills, setSkills] = useState(
    isDemoMode ? mockSkills : []
  );

  const [links, setLinks] = useState(
    isDemoMode ? mockProfileLinks : []
  );

  const [projects, setProjects] = useState(
    isDemoMode ? mockProfileProjects : []
  );

  const [certifications, setCertifications] = useState(
    isDemoMode ? mockProfileCertifications : []
  );

  // ================================================================
  // SKILL FORM STATE
  // ================================================================

  const [showSkillForm, setShowSkillForm] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [skillSaving, setSkillSaving] = useState(false);
  const [skillError, setSkillError] = useState('');

  const [skillForm, setSkillForm] = useState({
    name: '',
    category: '',
    level: '',
  });

  // ================================================================
  // LOAD PROFILE
  // ================================================================

  useEffect(() => {
    if (isDemoMode) {
      const demoProfile = {
        ...mockUser,
        ...mockProfileData,
        ...(authUser || {}),
      };

      setProfile(demoProfile);

      setEditForm({
        name: demoProfile.name || '',
        email: demoProfile.email || '',
        number: demoProfile.number || '',
        location: demoProfile.location || '',
        college_id: demoProfile.college_id || '',
      });

      setSkills(mockSkills);
      setLinks(mockProfileLinks);
      setProjects(mockProfileProjects);
      setCertifications(mockProfileCertifications);
      setMyJugaads([]);
      setLoading(false);

      return;
    }

    if (!isAuthenticated) {
      setProfile({});
      setSkills([]);
      setLinks([]);
      setProjects([]);
      setCertifications([]);
      setMyJugaads([]);
      setLoading(false);

      return;
    }

    let mounted = true;

    const loadProfile = async () => {
      setLoading(true);

      const results = await Promise.allSettled([
        api.getProfile(),
        api.getMyJugaads(),
        api.getSkills(),
      ]);

      if (!mounted) return;

      const [
        profileResult,
        jugaadsResult,
        skillsResult,
      ] = results;

      // ------------------------------------------------------------
      // PROFILE
      // ------------------------------------------------------------

      if (profileResult.status === 'fulfilled') {
        const raw = profileResult.value;

        const realProfile =
          raw?.user ??
          raw?.data ??
          raw ??
          {};

        const loadedProfile = {
          ...(authUser || {}),
          ...realProfile,
        };

        setProfile(loadedProfile);

        setEditForm({
          name: loadedProfile.name || '',
          email: loadedProfile.email || '',
          number: loadedProfile.number || '',
          location: loadedProfile.location || '',
          college_id: loadedProfile.college_id || '',
        });
      } else {
        const fallbackProfile = authUser || {};

        setProfile(fallbackProfile);

        setEditForm({
          name: fallbackProfile.name || '',
          email: fallbackProfile.email || '',
          number: fallbackProfile.number || '',
          location: fallbackProfile.location || '',
          college_id: fallbackProfile.college_id || '',
        });
      }

      // ------------------------------------------------------------
      // JUGAADS
      // ------------------------------------------------------------

      if (jugaadsResult.status === 'fulfilled') {
        const raw = jugaadsResult.value;

        const list =
          raw?.jugaads ??
          raw?.data ??
          (Array.isArray(raw) ? raw : []);

        setMyJugaads(
          Array.isArray(list) ? list : []
        );
      } else {
        setMyJugaads([]);
      }

      // ------------------------------------------------------------
      // SKILLS
      // ------------------------------------------------------------

      if (skillsResult.status === 'fulfilled') {
        const raw = skillsResult.value;

        const skillList =
          raw?.data ??
          raw?.skills ??
          (Array.isArray(raw) ? raw : []);

        setSkills(
          Array.isArray(skillList)
            ? skillList
            : []
        );
      } else {
        setSkills([]);
      }

      // Backend for these sections is not implemented yet.
      setLinks([]);
      setProjects([]);
      setCertifications([]);

      setLoading(false);
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [
    isDemoMode,
    isAuthenticated,
    authUser,
  ]);

  // ================================================================
  // PROFILE HELPERS
  // ================================================================

  const avatar =
    profile?.name
      ?.slice(0, 2)
      .toUpperCase() || 'U';

  const realStats = {
    jugaadsPosted: myJugaads.length,

    jugaadsCompleted:
      myJugaads.filter(
        (jugaad) =>
          jugaad.status === 'completed'
      ).length,

    jugaadsAccepted: 0,

    rating: null,

    totalEarnings: 0,

    score: null,
  };

  const stats = isDemoMode
    ? {
        jugaadsPosted:
          mockProfileStats.jugaadsPosted,

        jugaadsCompleted:
          mockProfileStats.jugaadsCompleted,

        jugaadsAccepted:
          mockProfileStats.jugaadsAccepted,

        rating:
          mockProfileStats.rating,

        totalEarnings:
          mockProfileStats.totalEarnings,

        score:
          profile.jugaadScore,
      }
    : realStats;

  const collegeName =
    profile?.college_name ??
    profile?.college?.name ??
    profile?.college ??
    'Not added yet';

  const branch =
    profile?.branch ??
    profile?.department ??
    'Not added yet';

  const year =
    profile?.year ??
    'Not added yet';

  const location =
    profile?.location ??
    'Not added yet';

  const bio =
    profile?.bio ??
    '';

  // ================================================================
  // PROFILE EDIT
  // ================================================================

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const openEditProfile = () => {
    setSaveError('');
    setSaveSuccess('');

    setEditForm({
      name: profile?.name || '',
      email: profile?.email || '',
      number: profile?.number || '',
      location: profile?.location || '',
      college_id: profile?.college_id || '',
    });

    setIsEditing(true);
  };

  const cancelEditProfile = () => {
    setIsEditing(false);
    setSaveError('');
    setSaveSuccess('');

    setEditForm({
      name: profile?.name || '',
      email: profile?.email || '',
      number: profile?.number || '',
      location: profile?.location || '',
      college_id: profile?.college_id || '',
    });
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    setSaving(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      const payload = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        number: editForm.number.trim(),
        location: editForm.location.trim(),
        college_id: Number(editForm.college_id),
      };

      if (!payload.name || payload.name.length < 2) {
        throw new Error(
          'Name must be at least 2 characters.'
        );
      }

      if (!/^\d{10}$/.test(payload.number)) {
        throw new Error(
          'Phone number must contain exactly 10 digits.'
        );
      }

      if (
        !Number.isFinite(payload.college_id) ||
        payload.college_id <= 0
      ) {
        throw new Error(
          'Please enter a valid college ID.'
        );
      }

      const result =
        await api.updateProfile(payload);

      const updatedProfile =
        result?.data ||
        result?.user ||
        result;

      setProfile((current) => ({
        ...current,
        ...updatedProfile,
      }));

      setEditForm({
        name:
          updatedProfile.name ||
          payload.name,

        email:
          updatedProfile.email ||
          payload.email,

        number:
          updatedProfile.number ||
          payload.number,

        location:
          updatedProfile.location ||
          payload.location,

        college_id:
          updatedProfile.college_id ||
          payload.college_id,
      });

      setSaveSuccess(
        'Profile updated successfully.'
      );

      setIsEditing(false);
    } catch (error) {
      setSaveError(
        error?.message ||
          error?.data?.message ||
          error?.data?.error ||
          'Unable to update your profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ================================================================
  // SKILL FUNCTIONS
  // ================================================================

  const resetSkillForm = () => {
    setSkillForm({
      name: '',
      category: '',
      level: '',
    });

    setEditingSkillId(null);
    setShowSkillForm(false);
    setSkillError('');
  };

  const openAddSkill = () => {
    setSkillForm({
      name: '',
      category: '',
      level: '',
    });

    setEditingSkillId(null);
    setSkillError('');
    setShowSkillForm(true);
  };

  const openEditSkill = (skill) => {
    setSkillForm({
      name: skill.name || '',
      category: skill.category || '',
      level: skill.level || '',
    });

    setEditingSkillId(skill.id);
    setSkillError('');
    setShowSkillForm(true);
  };

  const handleSkillChange = (event) => {
    const { name, value } = event.target;

    setSkillForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSaveSkill = async (event) => {
    event.preventDefault();

    if (isDemoMode) {
      return;
    }

    setSkillSaving(true);
    setSkillError('');

    try {
      const payload = {
        name: skillForm.name.trim(),
        category: skillForm.category.trim(),
        level: skillForm.level.trim(),
      };

      if (!payload.name) {
        throw new Error(
          'Skill name is required.'
        );
      }

      let result;

      if (editingSkillId) {
        result =
          await api.updateSkill(
            editingSkillId,
            payload
          );
      } else {
        result =
          await api.addSkill(payload);
      }

      const savedSkill =
        result?.data ||
        result?.skill ||
        result;

      if (!savedSkill?.id) {
        throw new Error(
          'The server did not return the saved skill.'
        );
      }

      if (editingSkillId) {
        setSkills((current) =>
          current.map((skill) =>
            Number(skill.id) ===
            Number(editingSkillId)
              ? savedSkill
              : skill
          )
        );
      } else {
        setSkills((current) => [
          savedSkill,
          ...current,
        ]);
      }

      resetSkillForm();
    } catch (error) {
      setSkillError(
        error?.message ||
          error?.data?.message ||
          error?.data?.error ||
          'Unable to save skill. Please try again.'
      );
    } finally {
      setSkillSaving(false);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (isDemoMode) {
      return;
    }

    const confirmed =
      window.confirm(
        'Are you sure you want to delete this skill?'
      );

    if (!confirmed) {
      return;
    }

    setSkillError('');

    try {
      await api.deleteSkill(skillId);

      setSkills((current) =>
        current.filter(
          (skill) =>
            Number(skill.id) !==
            Number(skillId)
        )
      );
    } catch (error) {
      setSkillError(
        error?.message ||
          error?.data?.message ||
          error?.data?.error ||
          'Unable to delete skill. Please try again.'
      );
    }
  };

  // ================================================================
  // RENDER
  // ================================================================

  return (
    <div>
      {/* Header */}
      <section className="pt-12 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <LED
            color="amber"
            pulse
            size={7}
          />

          <span className="font-technical text-[9px] text-ink-2">
            STUDENT PROFILE
          </span>

          {isDemoMode && (
            <span
              className="font-technical text-[7px] text-amber px-2 py-1 rounded"
              style={{
                border:
                  '1px solid rgba(214,138,60,.25)',
              }}
            >
              DEMO ACCOUNT
            </span>
          )}
        </div>

        <div className="surface-metal-brushed rounded-2xl p-6 sm:p-8 relative">
          <Rivet
            size={8}
            className="absolute top-3 left-3"
          />

          <Rivet
            size={8}
            className="absolute top-3 right-3"
          />

          <Rivet
            size={8}
            className="absolute bottom-3 left-3"
          />

          <Rivet
            size={8}
            className="absolute bottom-3 right-3"
          />

          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div
              className="grid place-items-center w-20 h-20 rounded-2xl font-display text-bg-0 text-2xl shrink-0"
              style={{
                background:
                  'linear-gradient(135deg, var(--amber), var(--amber-deep))',
                boxShadow:
                  'var(--glow-amber)',
              }}
            >
              {avatar}
            </div>

            <div className="flex-1 min-w-0">
              {loading ? (
                <p className="font-mono text-xs text-ink-3">
                  Loading profile...
                </p>
              ) : (
                <>
                  <h1 className="font-display text-3xl sm:text-4xl">
                    {profile?.name || 'Student'}
                  </h1>

                  <p className="font-mono text-xs text-ink-2 mt-2">
                    {branch} · {year}
                  </p>

                  <p className="font-mono text-xs text-ink-3 mt-1">
                    {collegeName}
                  </p>

                  {bio && (
                    <p className="font-editorial text-sm text-ink-1 mt-3 italic">
                      "{bio}"
                    </p>
                  )}

                  <p className="flex items-center gap-1.5 font-mono text-[10px] text-ink-3 mt-2">
                    <MapPin size={11} />
                    {location}
                  </p>

                  {profile?.email && (
                    <p className="font-mono text-[10px] text-ink-3 mt-2">
                      {profile.email}
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="surface-panel rounded-xl p-4 min-w-[180px]">
              <p className="font-technical text-[8px] text-ink-3">
                PROFILE STATUS
              </p>

              <p className="font-display text-xl text-mint mt-2">
                {isDemoMode
                  ? `${mockProfileData.profileCompletion}%`
                  : 'ACTIVE'}
              </p>

              <p className="font-mono text-[8px] text-ink-3 mt-2 leading-snug">
                {isDemoMode
                  ? mockProfileData.completionHint
                  : 'Profile information comes from your CampusJugaad account.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {!isDemoMode && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="min-h-[18px]">
            {saveSuccess && (
              <p className="font-mono text-[9px] text-mint">
                {saveSuccess}
              </p>
            )}

            {saveError && (
              <p className="font-mono text-[9px] text-coral">
                {saveError}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={openEditProfile}
            className="machine-control"
          >
            <span className="ctrl-led" />
            EDIT PROFILE
          </button>
        </div>
      )}

      {isEditing && !isDemoMode && (
        <section className="surface-panel rounded-2xl p-5 mt-6 mb-8">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <p className="font-technical text-[9px] text-amber">
                PROFILE EDITOR
              </p>

              <h2 className="font-display text-xl mt-1">
                Edit Profile
              </h2>
            </div>

            <button
              type="button"
              onClick={cancelEditProfile}
              disabled={saving}
              className="machine-control machine-control--ghost disabled:opacity-50"
            >
              <span className="ctrl-led" />
              CANCEL
            </button>
          </div>

          <form
            onSubmit={handleSaveProfile}
            className="grid sm:grid-cols-2 gap-4"
          >
            <ProfileInput
              id="profile-name"
              label="NAME"
              name="name"
              value={editForm.name}
              onChange={handleEditChange}
              required
              minLength={2}
              maxLength={100}
            />

            <ProfileInput
              id="profile-email"
              label="EMAIL"
              name="email"
              type="email"
              value={editForm.email}
              onChange={handleEditChange}
              required
            />

            <ProfileInput
              id="profile-number"
              label="PHONE NUMBER"
              name="number"
              type="tel"
              inputMode="numeric"
              value={editForm.number}
              onChange={handleEditChange}
              required
              maxLength={10}
              pattern="[0-9]{10}"
            />

            <ProfileInput
              id="profile-location"
              label="LOCATION"
              name="location"
              value={editForm.location}
              onChange={handleEditChange}
              maxLength={200}
            />

            <ProfileInput
              id="profile-college-id"
              label="COLLEGE ID"
              name="college_id"
              type="number"
              min="1"
              value={editForm.college_id}
              onChange={handleEditChange}
              required
            />

            <div className="sm:col-span-2 flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="machine-control disabled:opacity-50"
              >
                <span className="ctrl-led" />
                {saving
                  ? 'SAVING...'
                  : 'SAVE CHANGES'}
              </button>

              {saveError && (
                <p className="font-mono text-[9px] text-coral">
                  {saveError}
                </p>
              )}
            </div>
          </form>
        </section>
      )}

      {/* Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-8">
        <StatBlock
          label="JUGAADS POSTED"
          value={stats.jugaadsPosted}
          icon={<TrendingUp size={14} />}
          color="amber"
        />

        <StatBlock
          label="COMPLETED"
          value={stats.jugaadsCompleted}
          icon={<CheckCircle2 size={14} />}
          color="mint"
        />

        <StatBlock
          label="ACCEPTED"
          value={stats.jugaadsAccepted}
          icon={<Briefcase size={14} />}
          color="amber"
        />

        <StatBlock
          label="RATING"
          value={
            stats.rating !== null
              ? `${stats.rating}★`
              : '—'
          }
          icon={<Star size={14} />}
          color="amber"
        />

        <StatBlock
          label="EARNINGS"
          value={`₹${stats.totalEarnings}`}
          icon={<Wallet size={14} />}
          color="mint"
        />

        <StatBlock
          label="SCORE"
          value={
            stats.score !== null
              ? stats.score
              : '—'
          }
          icon={<Award size={14} />}
          color="coral"
        />
      </section>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* ============================================================
            SKILLS
        ============================================================ */}

        <section className="surface-panel rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span
              style={{
                color: 'var(--amber)',
              }}
            >
              <User size={13} />
            </span>

            <span className="font-technical text-[9px] text-ink-0">
              SKILLS
            </span>

            <span className="h-px flex-1 bg-metal-1/30" />

            {!isDemoMode && (
              <button
                type="button"
                onClick={openAddSkill}
                className="machine-control"
                style={{
                  padding: '5px 8px',
                }}
              >
                <Plus size={11} />
                ADD
              </button>
            )}
          </div>

          {skillError && (
            <div className="mb-3 surface-metal rounded-lg p-3">
              <p className="font-mono text-[9px] text-coral">
                {skillError}
              </p>
            </div>
          )}

          {showSkillForm && !isDemoMode && (
            <form
              onSubmit={handleSaveSkill}
              className="surface-metal rounded-xl p-4 mb-4"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="font-technical text-[9px] text-amber">
                  {editingSkillId
                    ? 'EDIT SKILL'
                    : 'ADD SKILL'}
                </p>

                <button
                  type="button"
                  onClick={resetSkillForm}
                  disabled={skillSaving}
                  className="text-ink-3 hover:text-ink-0"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="grid gap-3">
                <ProfileInput
                  id="skill-name"
                  label="SKILL NAME"
                  name="name"
                  value={skillForm.name}
                  onChange={handleSkillChange}
                  placeholder="e.g. React"
                  required
                  maxLength={100}
                />

                <ProfileInput
                  id="skill-category"
                  label="CATEGORY"
                  name="category"
                  value={skillForm.category}
                  onChange={handleSkillChange}
                  placeholder="e.g. Frontend"
                  maxLength={50}
                />

                <ProfileInput
                  id="skill-level"
                  label="LEVEL"
                  name="level"
                  value={skillForm.level}
                  onChange={handleSkillChange}
                  placeholder="e.g. Intermediate"
                  maxLength={50}
                />

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={skillSaving}
                    className="machine-control disabled:opacity-50"
                  >
                    <span className="ctrl-led" />
                    {skillSaving
                      ? 'SAVING...'
                      : editingSkillId
                        ? 'UPDATE SKILL'
                        : 'SAVE SKILL'}
                  </button>

                  <button
                    type="button"
                    onClick={resetSkillForm}
                    disabled={skillSaving}
                    className="machine-control machine-control--ghost disabled:opacity-50"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </form>
          )}

          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => {
                const color =
                  CATEGORY_COLORS[
                    skill.category
                  ] || 'amber';

                return (
                  <div
                    key={skill.id}
                    className="surface-metal rounded-lg px-3 py-2 flex items-center gap-2"
                    style={{
                      border: `1px solid color-mix(in srgb, var(--${color}) 25%, transparent)`,
                    }}
                  >
                    <span className="font-mono text-[10px] text-ink-0">
                      {skill.name}
                    </span>

                    {skill.level && (
                      <span
                        className="font-technical text-[7px]"
                        style={{
                          color: `var(--${color})`,
                        }}
                      >
                        {skill.level}
                      </span>
                    )}

                    {!isDemoMode && (
                      <div className="flex items-center gap-1 ml-1">
                        <button
                          type="button"
                          onClick={() =>
                            openEditSkill(skill)
                          }
                          className="text-ink-3 hover:text-amber"
                          title="Edit skill"
                        >
                          <Pencil size={11} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteSkill(
                              skill.id
                            )
                          }
                          className="text-ink-3 hover:text-coral"
                          title="Delete skill"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState text="No skills added yet." />
          )}
        </section>


        {/* ============================================================
            LINKS
        ============================================================ */}

        <section className="surface-panel rounded-2xl p-5">
          <SectionHeader
            icon={<Link2 size={13} />}
            label="LINKS & PROFILES"
          />

          {links.length > 0 ? (
            <div className="space-y-2">
              {links.map((link) => {
                const Icon =
                  LINK_ICONS[
                    link.platform
                  ] || Link2;

                return (
                  <div
                    key={link.id}
                    className="flex items-center gap-3 surface-metal rounded-lg px-3 py-2.5"
                  >
                    <Icon
                      size={14}
                      className="text-amber shrink-0"
                    />

                    <span className="font-mono text-[10px] text-ink-1 w-24 shrink-0">
                      {link.platform}
                    </span>

                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[9px] text-mint truncate flex-1 flex items-center gap-1"
                    >
                      {link.url}

                      <ExternalLink size={9} />
                    </a>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState text="No links added yet." />
          )}

          {!isDemoMode && (
            <p className="font-mono text-[8px] text-ink-3 mt-4">
              Profile links can be added once backend profile editing support is available.
            </p>
          )}
        </section>


        {/* ============================================================
            PROJECTS
        ============================================================ */}

        <section className="surface-panel rounded-2xl p-5">
          <SectionHeader
            icon={<Briefcase size={13} />}
            label="MY PROJECTS"
          />

          {projects.length > 0 ? (
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="surface-metal rounded-xl p-4"
                >
                  <p className="font-display text-sm">
                    {project.name}
                  </p>

                  {project.description && (
                    <p className="font-mono text-[10px] text-ink-2 mt-2">
                      {project.description}
                    </p>
                  )}

                  {Array.isArray(
                    project.technologies
                  ) && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {project.technologies.map(
                        (technology) => (
                          <span
                            key={technology}
                            className="font-technical text-[7px] px-2 py-1 rounded bg-bg-2 text-ink-2 border border-metal-1"
                          >
                            {technology}
                          </span>
                        )
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 mt-3">
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-mono text-[9px] text-mint"
                      >
                        <Github size={11} />
                        GitHub
                      </a>
                    )}

                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-mono text-[9px] text-amber"
                      >
                        <Globe size={11} />
                        Live
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="No projects added yet." />
          )}
        </section>


        {/* ============================================================
            CERTIFICATIONS
        ============================================================ */}

        <section className="surface-panel rounded-2xl p-5">
          <SectionHeader
            icon={<Award size={13} />}
            label="CERTIFICATIONS & ACHIEVEMENTS"
          />

          {certifications.length > 0 ? (
            <div className="space-y-2">
              {certifications.map(
                (certificate) => (
                  <div
                    key={certificate.id}
                    className="surface-metal rounded-xl p-3 flex items-start gap-3"
                  >
                    <span className="grid place-items-center w-8 h-8 rounded-lg bg-amber/10 text-amber shrink-0">
                      <GraduationCap size={14} />
                    </span>

                    <div>
                      <p className="font-display text-sm">
                        {certificate.title}
                      </p>

                      <p className="font-mono text-[9px] text-ink-3 mt-1">
                        {certificate.organization}
                        {certificate.date
                          ? ` · ${certificate.date}`
                          : ''}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <EmptyState text="No certifications added yet." />
          )}

          {isDemoMode &&
            mockAchievements
              .filter(
                (achievement) =>
                  achievement.unlocked
              )
              .map((achievement) => (
                <div
                  key={achievement.id}
                  className="surface-metal rounded-xl p-3 flex items-center gap-3 mt-2"
                >
                  <span className="text-lg">
                    {achievement.emoji}
                  </span>

                  <div>
                    <p className="font-technical text-[9px] text-ink-0">
                      {achievement.title}
                    </p>

                    <p className="font-mono text-[8px] text-ink-3">
                      {achievement.desc}
                    </p>
                  </div>
                </div>
              ))}
        </section>
      </div>


      {/* ================================================================
          EARNINGS
      ================================================================ */}

      <section className="mt-6 surface-wood rounded-2xl p-5">
        <SectionHeader
          icon={<Wallet size={13} />}
          label="EARNINGS"
          color="paper"
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="surface-panel rounded-xl p-3">
            <p className="font-technical text-[7px] text-ink-3">
              TOTAL EARNED
            </p>

            <p className="font-display text-xl text-amber mt-1">
              ₹
              {isDemoMode
                ? mockEarnings.totalEarned.toLocaleString()
                : '0'}
            </p>
          </div>

          <div className="surface-panel rounded-xl p-3">
            <p className="font-technical text-[7px] text-ink-3">
              THIS MONTH
            </p>

            <p className="font-display text-xl text-mint mt-1">
              ₹
              {isDemoMode
                ? mockEarnings.thisMonth.toLocaleString()
                : '0'}
            </p>
          </div>
        </div>

        {isDemoMode &&
          mockEarnings.recent.map(
            (earning) => (
              <div
                key={earning.id}
                className="flex items-center gap-2.5 surface-panel rounded-lg px-3 py-2 mt-2"
              >
                <span>
                  {earning.emoji}
                </span>

                <span className="font-mono text-[10px] text-ink-1 flex-1">
                  {earning.text}
                </span>

                <span className="font-mono text-[10px] text-mint">
                  +₹{earning.amount}
                </span>
              </div>
            )
          )}

        {!isDemoMode && (
          <p className="font-mono text-[8px] text-paper/60 mt-3">
            No earnings recorded yet.
          </p>
        )}
      </section>


      <div className="mt-8 flex justify-center">
        <Link
          to="/dashboard"
          className="machine-control machine-control--ghost"
        >
          <span className="ctrl-led" />
          BACK TO WORKSPACE
        </Link>
      </div>
    </div>
  );
}


// ================================================================
// PROFILE INPUT
// ================================================================

function ProfileInput({
  id,
  label,
  name,
  type = 'text',
  value,
  onChange,
  ...props
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="font-technical text-[8px] text-ink-3"
      >
        {label}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full mt-2 rounded-lg bg-bg-2 border border-metal-1 px-3 py-3 font-mono text-xs text-ink-0 outline-none focus:border-amber"
        {...props}
      />
    </div>
  );
}


// ================================================================
// SECTION HEADER
// ================================================================

function SectionHeader({
  icon,
  label,
  color = 'amber',
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span
        style={{
          color: `var(--${color})`,
        }}
      >
        {icon}
      </span>

      <span className="font-technical text-[9px] text-ink-0">
        {label}
      </span>

      <span className="h-px flex-1 bg-metal-1/30" />
    </div>
  );
}


// ================================================================
// STAT BLOCK
// ================================================================

function StatBlock({
  label,
  value,
  icon,
  color,
}) {
  return (
    <div className="surface-panel rounded-xl p-3">
      <div className="flex justify-between items-start">
        <span
          style={{
            color: `var(--${color})`,
          }}
        >
          {icon}
        </span>

        <span
          className="font-display text-xl"
          style={{
            color: `var(--${color})`,
          }}
        >
          {value}
        </span>
      </div>

      <p className="font-technical text-[7px] text-ink-3 mt-3">
        {label}
      </p>
    </div>
  );
}


// ================================================================
// EMPTY STATE
// ================================================================

function EmptyState({ text }) {
  return (
    <div className="surface-metal rounded-xl p-4">
      <p className="font-mono text-[9px] text-ink-3">
        {text}
      </p>
    </div>
  );
}