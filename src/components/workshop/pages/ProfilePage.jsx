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

  useEffect(() => {
    if (isDemoMode) {
      setProfile({
        ...mockUser,
        ...mockProfileData,
        ...(authUser || {}),
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
      ]);

      if (!mounted) return;

      const [profileResult, jugaadsResult] = results;

      if (profileResult.status === 'fulfilled') {
        const raw = profileResult.value;

        const realProfile =
          raw?.user ??
          raw?.data ??
          raw ??
          {};

        setProfile({
          ...(authUser || {}),
          ...realProfile,
        });
      } else {
        setProfile(authUser || {});
      }

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

      // No confirmed backend APIs yet for these.
      setSkills([]);
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
                    {profile?.name ||
                      'Student'}
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

      {/* Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-8">
        <StatBlock
          label="JUGAADS POSTED"
          value={stats.jugaadsPosted}
          icon={
            <TrendingUp size={14} />
          }
          color="amber"
        />

        <StatBlock
          label="COMPLETED"
          value={stats.jugaadsCompleted}
          icon={
            <CheckCircle2 size={14} />
          }
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
        {/* Skills */}
        <section className="surface-panel rounded-2xl p-5">
          <SectionHeader
            icon={<User size={13} />}
            label="SKILLS"
          />

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
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState text="No skills added yet." />
          )}
        </section>

        {/* Links */}
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

                      <ExternalLink
                        size={9}
                      />
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

        {/* Projects */}
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
                      {
                        project.description
                      }
                    </p>
                  )}

                  {Array.isArray(
                    project.technologies
                  ) && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {project.technologies.map(
                        (technology) => (
                          <span
                            key={
                              technology
                            }
                            className="font-technical text-[7px] px-2 py-1 rounded bg-bg-2 text-ink-2 border border-metal-1"
                          >
                            {
                              technology
                            }
                          </span>
                        )
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 mt-3">
                    {project.github && (
                      <a
                        href={
                          project.github
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-mono text-[9px] text-mint"
                      >
                        <Github
                          size={11}
                        />
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
                        <Globe
                          size={11}
                        />
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

        {/* Certifications */}
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
                      <GraduationCap
                        size={14}
                      />
                    </span>

                    <div>
                      <p className="font-display text-sm">
                        {
                          certificate.title
                        }
                      </p>

                      <p className="font-mono text-[9px] text-ink-3 mt-1">
                        {
                          certificate.organization
                        }
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
                    {
                      achievement.emoji
                    }
                  </span>

                  <div>
                    <p className="font-technical text-[9px] text-ink-0">
                      {
                        achievement.title
                      }
                    </p>

                    <p className="font-mono text-[8px] text-ink-3">
                      {
                        achievement.desc
                      }
                    </p>
                  </div>
                </div>
              ))}
        </section>
      </div>

      {/* Earnings */}
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

function EmptyState({ text }) {
  return (
    <div className="surface-metal rounded-xl p-4">
      <p className="font-mono text-[9px] text-ink-3">
        {text}
      </p>
    </div>
  );
}