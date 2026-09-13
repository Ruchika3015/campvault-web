import { Link } from 'react-router-dom';
import { DepthLayer } from '@/components/primitives/DepthLayer';
import { LED } from '@/components/primitives/Details';
import {
  Code,
  Palette,
  Cpu,
  BookOpen,
  Camera,
  Megaphone,
  ArrowRight,
} from 'lucide-react';

const CATEGORIES = [
  {
    icon: Code,
    name: 'Software & Web Development',
    accent: 'amber',
    popularSkills: ['React', 'Node.js', 'Python', 'Fullstack', 'APIs'],
    description: 'Bug fixing, frontend dashboards, backend REST APIs, bot scripting, and mobile app features.',
    avgRate: '₹800 – ₹3,500',
  },
  {
    icon: Palette,
    name: 'UI/UX & Graphic Design',
    accent: 'mint',
    popularSkills: ['Figma', 'Vector Logos', 'Canva Pro', 'Fest Posters', 'UI Prototypes'],
    description: 'College event posters, modern pitch decks, brand identity guidelines, and web design mockups.',
    avgRate: '₹500 – ₹2,000',
  },
  {
    icon: Cpu,
    name: 'Hardware, IoT & Embedded',
    accent: 'coral',
    popularSkills: ['Arduino', 'ESP32', 'Raspberry Pi', 'Sensors', 'Soldering'],
    description: 'Minor/major year engineering projects, sensor wiring, microcontrollers, and circuit troubleshooting.',
    avgRate: '₹750 – ₹3,000',
  },
  {
    icon: BookOpen,
    name: 'Academic & Subject Tutoring',
    accent: 'amber',
    popularSkills: ['Discrete Math', 'DSA Algorithms', 'DBMS & SQL', 'Lab Manuals', 'Proofs'],
    description: 'Peer-to-peer exam prep, theorem explanations, code walkthroughs, and assignment guidance.',
    avgRate: '₹400 – ₹1,500',
  },
  {
    icon: Camera,
    name: 'Photography & Video Production',
    accent: 'mint',
    popularSkills: ['Premiere Pro', 'DaVinci Resolve', 'Reels Editing', 'Event Shoots', 'Sound'],
    description: 'Club fest teaser trailers, viral vertical reels, event photography, and portfolio video editing.',
    avgRate: '₹600 – ₹2,500',
  },
  {
    icon: Megaphone,
    name: 'Marketing, PR & Events',
    accent: 'coral',
    popularSkills: ['Sponsorship Decks', 'Campaign Strategy', 'Campus PR', 'Influencer Outreach'],
    description: 'Sponsor outreach drives, campus ambassador campaigns, club event logistics, and copy drafting.',
    avgRate: '₹500 – ₹2,000',
  },
];

export function CategoriesShowcase() {
  return (
    <section
      id="categories"
      className="relative py-28 px-4 sm:px-8 lg:px-16 overflow-hidden grain preserve-3d border-t border-metal-2/40"
    >
      <DepthLayer depth={-130} className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/3 left-1/3 w-[800px] h-[550px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(13,148,136,0.08), transparent 60%)',
            filter: 'blur(70px)',
          }}
        />
      </DepthLayer>
      <div className="absolute inset-0 tech-diagram pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="max-w-3xl mb-14">
          <div className="flex items-center gap-3 mb-4">
            <LED color="mint" pulse size={7} />
            <span className="font-technical text-[10px] font-bold tracking-wider text-ink-0">
              05 — SKILL DOMAINS
            </span>
            <span className="h-px w-12 bg-metal-2" />
            <span className="font-technical text-[10px] text-ink-2">CAMPUS EXPERTISE</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink-0 tracking-tight">
            POPULAR CAMPUS DISCIPLINES.
          </h2>
          <p className="mt-4 text-base text-ink-1 leading-relaxed">
            Whether you need assistance with an urgent assignment or have tech skills you want to monetize,
            there’s an active demand across every college department.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat, index) => {
            const IconComponent = cat.icon;
            return (
              <div
                key={index}
                className="surface-metal-brushed rounded-2xl p-6 border-2 border-metal-2 shadow-sm hover:border-amber/70 hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span
                      className={`grid place-items-center w-12 h-12 rounded-xl border-2 ${
                        cat.accent === 'amber'
                          ? 'bg-amber/10 border-amber/30 text-amber'
                          : cat.accent === 'mint'
                          ? 'bg-mint/10 border-mint/30 text-mint'
                          : 'bg-coral/10 border-coral/30 text-coral'
                      }`}
                    >
                      <IconComponent size={22} />
                    </span>

                    <span className="font-mono text-xs font-bold text-amber">
                      {cat.avgRate}
                    </span>
                  </div>

                  <h3 className="font-display text-lg text-ink-0 mb-2 group-hover:text-amber transition-colors">
                    {cat.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-ink-1 leading-relaxed mb-5">
                    {cat.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {cat.popularSkills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="font-mono text-[9px] px-2 py-0.5 rounded bg-bg-1 text-ink-0 border border-metal-2 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-metal-2/40 flex items-center justify-between">
                  <span className="font-technical text-[9px] text-ink-2 tracking-wider">
                    TYPICAL SCOPE: 1–4 DAYS
                  </span>

                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-1 font-technical text-xs font-bold text-amber hover:underline group-hover:translate-x-0.5 transition-all"
                  >
                    <span>EXPLORE</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
