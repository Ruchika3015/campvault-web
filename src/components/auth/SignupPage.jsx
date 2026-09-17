import { SignUp } from '@clerk/clerk-react';
import { LED } from '@/components/primitives/Details';

// Clerk appearance — same tokens as LoginPage for visual consistency
const clerkAppearance = {
  layout: {
    logoPlacement: 'none',
    showOptionalFields: false,
  },
  variables: {
    colorBackground:       '#0e0e0f',
    colorInputBackground:  '#17181a',
    colorInputText:        '#e8e8e8',
    colorText:             '#e8e8e8',
    colorTextSecondary:    '#a0a0a0',
    colorPrimary:          '#f59e0b',
    colorDanger:           '#f87171',
    borderRadius:          '0.75rem',
    fontFamily:            'inherit',
    fontSize:              '14px',
  },
  elements: {
    card:                    'bg-[#17181a] border border-[#2a2a2d] shadow-none rounded-2xl',
    headerTitle:             'font-display text-2xl tracking-tight text-[#e8e8e8]',
    headerSubtitle:          'font-technical text-[10px] text-[#a0a0a0] tracking-widest',
    formFieldLabel:          'font-technical text-[9px] text-[#a0a0a0] tracking-widest',
    formFieldInput:          'bg-[#0e0e0f] border-[#2a2a2d] text-[#e8e8e8] rounded-lg text-sm focus:border-[#f59e0b]',
    formButtonPrimary:       'bg-[#f59e0b] text-[#0e0e0f] font-technical text-[10px] tracking-widest hover:brightness-110 rounded-xl',
    footerActionLink:        'text-[#f59e0b] font-technical text-[10px]',
    dividerLine:             'bg-[#2a2a2d]',
    dividerText:             'text-[#505054] font-technical text-[9px]',
    socialButtonsBlockButton:'border-[#2a2a2d] bg-[#17181a] text-[#e8e8e8] hover:bg-[#1e1e21] rounded-xl',
    identityPreviewText:     'text-[#e8e8e8]',
    identityPreviewEditButton:'text-[#f59e0b]',
    alertText:               'font-technical text-[10px]',
  },
};

export function SignupPage() {
  return (
    <div className="relative min-h-screen overflow-y-auto overflow-x-hidden grain preserve-3d flex flex-col lg:flex-row items-center lg:items-stretch justify-center">
      {/* ===== Background ===== */}
      <div className="absolute inset-0 tech-diagram pointer-events-none" />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0">
        <img
          src="/logo.svg"
          alt=""
          aria-hidden="true"
          className="w-[520px] sm:w-[750px] lg:w-[1000px] max-w-none object-contain logo-watermark"
        />
      </div>

      <div className="bg-lettering opacity-[0.02]">JOIN</div>
      <div className="absolute inset-0 haze pointer-events-none" />
      <div className="absolute inset-0 depth-fog pointer-events-none" />

      <div
        className="absolute top-[10%] right-[15%] w-[600px] h-[500px] rounded-full anim-breathe pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(93,184,154,0.08), transparent 60%)', filter: 'blur(70px)' }}
      />

      {/* ===== LEFT — editorial statement (desktop only) ===== */}
      <div className="relative z-10 hidden lg:flex flex-1 items-center px-6 sm:px-12 lg:px-20 pt-24 pb-12">
        <div className="max-w-lg">
          <div className="flex items-center gap-3 mb-10 anim-reveal">
            <LED color="mint" pulse size={7} />
            <span className="font-technical text-[9px] text-ink-2 tracking-widest">01 — REGISTRATION TERMINAL</span>
          </div>
          <h1 className="font-display text-5xl xl:text-6xl tracking-tight text-ink-0 leading-none mb-6 anim-reveal" style={{ animationDelay: '0.1s' }}>
            JOIN<br /><span className="text-mint">CAMPUSVAULT.</span>
          </h1>
          <p className="text-sm text-ink-2 max-w-sm anim-reveal" style={{ animationDelay: '0.2s' }}>
            The campus freelance exchange. Post gigs, land jugaads, build your rep — all within your college ecosystem.
          </p>
        </div>
      </div>

      {/* ===== RIGHT — Clerk SignUp terminal ===== */}
      <div className="relative z-10 w-full max-w-md lg:flex-1 lg:max-w-lg flex flex-col items-center justify-center px-4 sm:px-8 lg:px-12 py-10 lg:py-24">
        {/* Mobile header */}
        <div className="lg:hidden mb-6 w-full max-w-sm">
          <div className="flex items-center gap-2 mb-3">
            <LED color="mint" pulse size={6} />
            <span className="font-technical text-[9px] text-ink-2">01 — Registration Terminal</span>
          </div>
          <h1 className="font-display text-3xl tracking-tight text-ink-0">
            READY FOR <span className="text-mint">CAMPUSVAULT?</span>
          </h1>
          <p className="mt-2 text-xs text-ink-2">
            Create your account. Your next gig is waiting.
          </p>
        </div>

        <SignUp
          appearance={clerkAppearance}
          redirectUrl="/complete-profile"
          signInUrl="/login"
          afterSignUpUrl="/complete-profile"
        />

        <div className="mt-4 flex flex-col items-center justify-center gap-2">
          <span className="font-technical text-[7px] text-ink-2">CAMPUSVAULT · STUDENT ROLE ASSIGNED AUTOMATICALLY</span>
        </div>
      </div>
    </div>
  );
}
