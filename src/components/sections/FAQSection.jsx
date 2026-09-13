import { useState } from 'react';
import { DepthLayer } from '@/components/primitives/DepthLayer';
import { LED } from '@/components/primitives/Details';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'Is Campusvault completely free to join and use?',
    a: 'Yes! Joining Campusvault and posting your requirements is 100% free for students. There are zero platform membership fees and zero commission cuts on what students earn from each other.',
  },
  {
    q: 'Who is eligible to post or accept gigs?',
    a: 'Any university student with an affiliated college email or campus profile. Every student account has full dual capabilities: you can post a requirement when you need help, and apply to work on peer gigs when you want to earn.',
  },
  {
    q: 'How do payments work between students?',
    a: 'Payments are handled directly student-to-student (via UPI, Google Pay, PhonePe, or cash upon delivery). Once the gig poster inspects and approves the completed work, payment is made directly with zero platform holding delays.',
  },
  {
    q: 'Can I negotiate or submit a counter-offer on a gig?',
    a: 'Absolutely! Our built-in Proposal & Bargain engine lets you pitch your custom rate and estimated delivery timeline. You can accept the poster’s listed budget or suggest a counter-offer that reflects the task complexity.',
  },
  {
    q: 'What if I need to withdraw my proposal after applying?',
    a: 'You have full autonomy. You can withdraw any pending application at any time with a single click from your Applications dashboard with zero penalty or record impact, provided the poster hasn’t already finalized it.',
  },
  {
    q: 'How are quality and safety maintained on campus?',
    a: 'Campusvault relies on college domain verification, peer ratings (1–5 stars), and written reviews on completed deliverables. You can view any student’s past track record, completed gig count, and branch details before accepting.',
  },
];

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section
      id="faq"
      className="relative py-28 px-4 sm:px-8 lg:px-16 overflow-hidden grain preserve-3d border-t border-metal-2/40"
    >
      <DepthLayer depth={-100} className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 right-1/4 w-[700px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(251,113,133,0.06), transparent 60%)',
            filter: 'blur(70px)',
          }}
        />
      </DepthLayer>
      <div className="absolute inset-0 tech-diagram pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <LED color="amber" pulse size={7} />
            <span className="font-technical text-[10px] font-bold tracking-wider text-ink-0">
              06 — COMMON INQUIRIES
            </span>
            <LED color="mint" pulse size={7} />
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink-0 tracking-tight">
            FREQUENTLY ASKED QUESTIONS.
          </h2>
          <p className="mt-4 text-base text-ink-1 max-w-xl mx-auto">
            Everything you need to know about getting started on Campusvault.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIdx === index;
            return (
              <div
                key={index}
                className="surface-metal-brushed rounded-2xl border-2 border-metal-2 shadow-sm overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? -1 : index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <span className="font-display text-base sm:text-lg text-ink-0">
                    {faq.q}
                  </span>
                  <span className="grid place-items-center w-8 h-8 rounded-lg bg-bg-1 border border-metal-2 text-ink-0 shrink-0">
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 border-t border-metal-2/40">
                    <p className="text-sm text-ink-1 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
