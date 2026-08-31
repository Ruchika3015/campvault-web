import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LED } from '@/components/primitives/Details';

const PAGE_CONTENT = {
  about: {
    label: 'ABOUT CAMPUSVAULT',
    title: 'Problems meet people who can solve them.',
    paragraphs: [
      'CampusVault is a student-to-student exchange for the things campus life throws at you. Post what you need, find a student with the right skill, and get it done without the usual guesswork.',
      'The exchange is built around practical help, fair conversations, and the resourcefulness students already bring to every deadline, fest, project, and late-night problem.',
    ],
  },
  program: {
    label: 'CAMPUS PROGRAM',
    title: 'Bring the Jugaad Exchange to your campus.',
    paragraphs: [
      'Campus programs give student communities a simple way to share skills, discover useful help, and make the most of the talent already around them.',
      'If you are organising a campus community or student initiative, reach out to explore how CampusVault can fit into your exchange.',
    ],
  },
  privacy: {
    label: 'PRIVACY POLICY',
    title: 'Your information stays yours.',
    paragraphs: [
      'CampusVault uses account information to provide the exchange, keep conversations connected to the right people, and improve the experience for students.',
      'We do not sell personal information. Use the Settings area in your workspace to review available privacy and account controls.',
    ],
  },
  terms: {
    label: 'TERMS & CONDITIONS',
    title: 'Use the exchange with care.',
    paragraphs: [
      'CampusVault is a place for students to offer and request legitimate help. Keep proposals accurate, communicate respectfully, and agree on expectations before work begins.',
      'You are responsible for the information you share and the agreements you make with other students. We may restrict activity that harms the exchange or its members.',
    ],
  },
};

export function InfoPage({ kind }) {
  const content = PAGE_CONTENT[kind];

  return (
    <div className="min-h-screen bg-bg-0 text-ink-0 grain">
      <main className="max-w-4xl mx-auto px-6 py-10 sm:py-16">
        <Link to="/" className="inline-flex items-center gap-2 font-technical text-[10px] text-ink-2 hover:text-amber transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded-md px-1 py-1">
          <ArrowLeft size={13} /> BACK TO EXCHANGE
        </Link>

        <section className="mt-20 surface-metal-brushed metal-scratches rounded-3xl p-7 sm:p-12">
          <div className="flex items-center gap-3 mb-5">
            <LED color="amber" pulse size={7} />
            <span className="font-technical text-[10px] text-ink-2 tracking-[0.2em]">{content.label}</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl leading-[0.95] tracking-tight max-w-3xl">{content.title}</h1>
          <div className="mt-10 max-w-2xl space-y-5">
            {content.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-base text-ink-1 leading-relaxed">{paragraph}</p>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
