import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LED } from '@/components/primitives/Details';

const PAGE_CONTENT = {
  about: {
    label: 'ABOUT CAMPUSVAULT',
    title: 'Problems meet people who can solve them.',
    paragraphs: [
      'Campusvault is a student-to-student exchange for the things campus life throws at you. Post what you need, find a student with the right skill, and get it done without the usual guesswork.',
      'The exchange is built around practical help, fair conversations, and the resourcefulness students already bring to every deadline, fest, project, and late-night problem.',
    ],
  },

  program: {
    label: 'CAMPUS PROGRAM',
    title: 'Bring the Campusvault Gig Exchange to your campus.',
    paragraphs: [
      'Campus programs give student communities a simple way to share skills, discover useful help, and make the most of the talent already around them.',
      'If you are organising a campus community or student initiative, reach out to explore how Campusvault can fit into your exchange.',
    ],
  },

  privacy: {
    label: 'PRIVACY POLICY',
    title: 'Your information stays yours.',
    paragraphs: [
      'Campusvault may collect account information such as your name, email address, phone number, college information, profile details, skills, projects, applications, proposals, and other information you choose to provide.',
      'We use this information to create and manage accounts, connect students with relevant gigs, support conversations, process platform activity, and improve the Campusvault experience.',
      'Payment information is processed through our payment service provider. Campusvault does not intentionally store your complete card, UPI, or banking credentials on its own servers.',
      'We may also process information related to gigs, proposals, messages, transactions, and platform activity when necessary to operate, secure, and support the service.',
      'We do not sell personal information. Information may be shared with service providers when necessary to provide platform functionality, process payments, maintain security, or comply with applicable legal requirements.',
      'You can contact Campusvault if you have questions about your information, privacy, or account.',
    ],
  },

  terms: {
    label: 'TERMS & CONDITIONS',
    title: 'Use the exchange with care.',
    paragraphs: [
      'Campusvault is a student-to-student platform that allows users to post gigs, request help, submit proposals, communicate with other users, and arrange legitimate services through the platform.',
      'Users are responsible for the accuracy of the information they provide, the proposals they submit, the services they offer, and the agreements they make with other users.',
      'Users must not use Campusvault for unlawful, fraudulent, abusive, harmful, or misleading activities. Campusvault may restrict, suspend, or remove accounts or content that violates these Terms or creates a risk to users or the platform.',
      'Before accepting a proposal or making a payment, users should review the gig description, agreed price, expected work, timelines, and other relevant requirements with the other party.',
      'Payments made through Campusvault may be processed by third-party payment service providers. Users agree to provide accurate information required for payment processing and to follow the applicable payment terms.',
      'Campusvault provides the platform for students to connect and exchange services. Unless explicitly stated otherwise, Campusvault does not guarantee the quality, accuracy, availability, or completion of services offered by another user.',
      'Users are responsible for resolving service expectations and communicating clearly with the other party. Where a platform dispute or payment issue requires review, Campusvault may examine relevant platform records and communications.',
      'By using Campusvault, you agree to use the platform responsibly and comply with these Terms, applicable laws, and the policies published on the website.',
    ],
  },

  refund: {
    label: 'REFUND & CANCELLATION',
    title: 'Clear payment and cancellation expectations.',
    paragraphs: [
      'Campusvault facilitates connections between students for legitimate services and may provide payment functionality for accepted gigs. Before making a payment, users should review the gig description, agreed amount, and expected work with the other party.',
      'A cancellation or refund request should be raised as soon as possible through Campusvault support. Refund eligibility may depend on the status of the gig, whether the service has started or been completed, the reason for cancellation, and the information available to Campusvault.',
      'If a gig has not started and both parties agree to cancel, the payment may be considered for refund subject to the applicable payment and transaction conditions.',
      'Where a service has already started or been completed, a refund is not automatically guaranteed. Campusvault may review the circumstances, relevant communications, gig details, and transaction information before making a decision.',
      'If a user believes that a payment was made incorrectly or that an agreed service was not delivered as described, they should contact Campusvault support with the relevant gig and transaction details.',
      'Approved refunds will be processed through the applicable payment provider and may take additional time to appear in the original payment method, depending on the payment provider and financial institution.',
      'Campusvault does not guarantee refunds for circumstances arising solely from disagreements between users where the agreed service has already been provided or where the transaction does not meet the applicable refund conditions.',
      'For cancellation or refund assistance, contact Campusvault support with your account details, gig information, transaction reference, and a clear description of the issue.',
    ],
  },

  contact: {
  label: 'CONTACT US',
  title: 'We are here to help.',
  paragraphs: [
    'If you have questions about CampusVault, payments, cancellations, refunds, your account, or a service provided through the platform, you can contact our support team.',
    <div>
  For support and payment-related queries, email us at{' '}
  <a
  href="mailto:CampusVault.co@gmail.com"
  onClick={(event) => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(
      navigator.userAgent
    );

    if (!isMobile) {
      event.preventDefault();

      window.open(
        'https://mail.google.com/mail/?view=cm&fs=1&to=CampusVault.co@gmail.com',
        '_blank'
      );
    }
  }}
  className="text-amber hover:underline"
>
  CampusVault.co@gmail.com
</a>
  . Please include your registered email address and relevant gig or
  transaction details so that we can assist you efficiently.
</div>,
    'We aim to review support requests and respond as soon as reasonably possible.',
  ],
},
};

export function InfoPage({ kind }) {
  const content = PAGE_CONTENT[kind];

  if (!content) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg-0 text-ink-0 grain">
      <main className="max-w-4xl mx-auto px-6 py-10 sm:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-technical text-[10px] text-ink-2 hover:text-amber transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded-md px-1 py-1"
        >
          <ArrowLeft size={13} /> BACK TO EXCHANGE
        </Link>

        <section className="mt-20 surface-metal-brushed metal-scratches rounded-3xl p-7 sm:p-12">
          <div className="flex items-center gap-3 mb-5">
            <LED color="amber" pulse size={7} />

            <span className="font-technical text-[10px] text-ink-2 tracking-[0.2em]">
              {content.label}
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl leading-[0.95] tracking-tight max-w-3xl">
            {content.title}
          </h1>

          <div className="mt-10 max-w-2xl space-y-5">
            {content.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="text-base text-ink-1 leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}