// Centralized mock data for the Jugaad workflow: discovery, interests,
// requests, negotiations, conversations, and notifications.
// Structured to match backend models so it can be swapped with API responses.

// ─── Skills available on campus ───────────────────────────────────────
export const CAMPUS_SKILLS = [
  { id: 'sk1', name: 'React', category: 'CODE' },
  { id: 'sk2', name: 'Python', category: 'CODE' },
  { id: 'sk3', name: 'C++', category: 'CODE' },
  { id: 'sk4', name: 'UI Design', category: 'DESIGN' },
  { id: 'sk5', name: 'Poster Design', category: 'DESIGN' },
  { id: 'sk6', name: 'Photoshop', category: 'DESIGN' },
  { id: 'sk7', name: 'Video Editing', category: 'VIDEO' },
  { id: 'sk8', name: 'Motion Graphics', category: 'VIDEO' },
  { id: 'sk9', name: 'DBMS', category: 'ACADEMICS' },
  { id: 'sk10', name: 'PPT Design', category: 'PRESENTATION' },
  { id: 'sk11', name: 'Arduino', category: 'OTHER' },
  { id: 'sk12', name: 'Content Writing', category: 'OTHER' },
];

export const JUGAAD_CATEGORIES = [
  'CODE', 'DESIGN', 'VIDEO', 'ACADEMICS', 'PRESENTATION', 'OTHER',
];

// ─── Jugaads posted by OTHER students (discovery feed) ───────────────
export const mockDiscoveryFeed = [
  {
    id: 'JG-2001',
    title: 'Need a React Developer for Event Website',
    description: 'Need a responsive single-page website for our college tech fest. Should have registration form, schedule display, and sponsor section.',
    category: 'CODE',
    skillRequired: 'React',
    amount: 500,
    deadline: '2026-08-25',
    poster: { id: 'u10', name: 'Arjun Mehta', initials: 'AM', college: 'IIT Delhi', rating: 4.8, avatar: 'AM' },
    postedAt: '2026-08-22T08:00:00Z',
    status: 'open',
    interestedCount: 3,
    matchPercentage: 92,
  },
  {
    id: 'JG-2002',
    title: 'Design a Logo for Our Startup',
    description: 'We are building a food-delivery startup. Need a clean, modern logo that works on both light and dark backgrounds.',
    category: 'DESIGN',
    skillRequired: 'UI Design',
    amount: 300,
    deadline: '2026-08-28',
    poster: { id: 'u11', name: 'Priya Sharma', initials: 'PS', college: 'BITS Pilani', rating: 4.9, avatar: 'PS' },
    postedAt: '2026-08-22T06:00:00Z',
    status: 'open',
    interestedCount: 5,
    matchPercentage: 85,
  },
  {
    id: 'JG-2003',
    title: 'Edit a 3-Minute Promo Video',
    description: 'Raw footage from our fest. Need color correction, transitions, background music sync, and a title card.',
    category: 'VIDEO',
    skillRequired: 'Video Editing',
    amount: 650,
    deadline: '2026-08-24',
    poster: { id: 'u12', name: 'Karan Singh', initials: 'KS', college: 'VIT Vellore', rating: 4.7, avatar: 'KS' },
    postedAt: '2026-08-21T14:00:00Z',
    status: 'open',
    interestedCount: 2,
    matchPercentage: 78,
  },
  {
    id: 'JG-2004',
    title: 'DBMS Assignment — Normalization Help',
    description: 'I have a database schema that needs to be normalized to 3NF. Need someone to walk me through it and verify the final design.',
    category: 'ACADEMICS',
    skillRequired: 'DBMS',
    amount: 150,
    deadline: '2026-08-26',
    poster: { id: 'u13', name: 'Sneha Reddy', initials: 'SR', college: 'NIT Warangal', rating: 4.6, avatar: 'SR' },
    postedAt: '2026-08-21T10:00:00Z',
    status: 'open',
    interestedCount: 1,
    matchPercentage: 68,
  },
  {
    id: 'JG-2005',
    title: 'Create a Professional PPT for Investor Pitch',
    description: 'Need a 15-slide investor pitch deck. I have the content, just need it to look polished and professional.',
    category: 'PRESENTATION',
    skillRequired: 'PPT Design',
    amount: 250,
    deadline: '2026-08-27',
    poster: { id: 'u14', name: 'Rohit Verma', initials: 'RV', college: 'DTU', rating: 4.5, avatar: 'RV' },
    postedAt: '2026-08-20T16:00:00Z',
    status: 'open',
    interestedCount: 4,
    matchPercentage: 60,
  },
  {
    id: 'JG-2006',
    title: 'Arduino Line Follower Robot Wiring',
    description: 'Need help wiring and coding an Arduino line follower. Have the components, need guidance on circuit and code.',
    category: 'OTHER',
    skillRequired: 'Arduino',
    amount: 200,
    deadline: '2026-08-30',
    poster: { id: 'u15', name: 'Aisha Khan', initials: 'AK', college: 'IIIT Hyderabad', rating: 4.8, avatar: 'AK' },
    postedAt: '2026-08-20T12:00:00Z',
    status: 'open',
    interestedCount: 0,
    matchPercentage: 45,
  },
  {
    id: 'JG-2007',
    title: 'Photoshop Edit for Instagram Post',
    description: 'Need 5 product photos edited for an Instagram campaign. Background removal, color grading, and text overlay.',
    category: 'DESIGN',
    skillRequired: 'Photoshop',
    amount: 400,
    deadline: '2026-08-23',
    poster: { id: 'u16', name: 'Vikram Patel', initials: 'VP', college: 'NIT Surathkal', rating: 4.7, avatar: 'VP' },
    postedAt: '2026-08-22T02:00:00Z',
    status: 'open',
    interestedCount: 6,
    matchPercentage: 72,
  },
  {
    id: 'JG-2008',
    title: 'C++ Data Structures Problem Set',
    description: 'Need help solving 5 C++ DSA problems involving trees and graphs. Need well-commented solutions.',
    category: 'CODE',
    skillRequired: 'C++',
    amount: 350,
    deadline: '2026-08-29',
    poster: { id: 'u17', name: 'Nisha Gupta', initials: 'NG', college: 'IIT Bombay', rating: 4.9, avatar: 'NG' },
    postedAt: '2026-08-19T18:00:00Z',
    status: 'open',
    interestedCount: 2,
    matchPercentage: 88,
  },
  {
    id: 'JG-2009',
    title: 'Motion Graphics for YouTube Intro',
    description: 'Need a 5-second animated YouTube channel intro. Modern, clean, with my channel name and logo.',
    category: 'VIDEO',
    skillRequired: 'Motion Graphics',
    amount: 550,
    deadline: '2026-08-31',
    poster: { id: 'u18', name: 'Aditya Joshi', initials: 'AJ', college: 'BITS Goa', rating: 4.6, avatar: 'AJ' },
    postedAt: '2026-08-19T08:00:00Z',
    status: 'open',
    interestedCount: 1,
    matchPercentage: 50,
  },
  {
    id: 'JG-2010',
    title: 'Python Web Scraper for Research Data',
    description: 'Need a Python script to scrape product data from an e-commerce site and export to CSV. Should handle pagination.',
    category: 'CODE',
    skillRequired: 'Python',
    amount: 450,
    deadline: '2026-09-02',
    poster: { id: 'u19', name: 'Meera Nair', initials: 'MN', college: 'IIT Madras', rating: 4.8, avatar: 'MN' },
    postedAt: '2026-08-18T14:00:00Z',
    status: 'open',
    interestedCount: 3,
    matchPercentage: 81,
  },
];

// ─── Jugaads posted by the CURRENT user (My Jugaads) ─────────────────
export const mockMyPostedJugaads = [
  {
    id: 'JG-1001',
    title: 'Fest Poster Design',
    description: 'Need a vibrant fest poster with event details, sponsor logos, and QR code.',
    category: 'DESIGN',
    skillRequired: 'Poster Design',
    amount: 300,
    deadline: '2026-08-20',
    status: 'receiving-requests',
    interestedStudents: [
      { id: 'u20', name: 'Kabir Malhotra', initials: 'KM', skills: ['Poster Design', 'Photoshop'], rating: 4.7, requestType: 'interest', proposedAmount: null, requestStatus: 'pending', requestedAt: '2026-08-21T10:00:00Z' },
      { id: 'u21', name: 'Ananya Roy', initials: 'AR', skills: ['UI Design', 'Poster Design'], rating: 4.8, requestType: 'interest', proposedAmount: null, requestStatus: 'pending', requestedAt: '2026-08-21T12:00:00Z' },
      { id: 'u22', name: 'Diya Mehta', initials: 'DM', skills: ['Photoshop'], rating: 4.9, requestType: 'bargain', proposedAmount: 350, requestStatus: 'pending', message: 'I can deliver within 2 days with unlimited revisions.', requestedAt: '2026-08-21T14:00:00Z' },
    ],
    acceptedStudent: null,
    postedAt: '2026-08-20T08:00:00Z',
  },
  {
    id: 'JG-1002',
    title: 'C++ Segmentation Fault Debugging',
    description: 'My C++ program crashes with a segfault. Need someone to identify and fix the issue.',
    category: 'CODE',
    skillRequired: 'C++',
    amount: 200,
    deadline: '2026-08-18',
    status: 'assigned',
    interestedStudents: [
      { id: 'u23', name: 'Aman Khanna', initials: 'AK', skills: ['C++', 'Python'], rating: 4.7, requestType: 'interest', proposedAmount: null, requestStatus: 'accepted', requestedAt: '2026-08-17T10:00:00Z' },
      { id: 'u24', name: 'Rahul Jain', initials: 'RJ', skills: ['C++'], rating: 4.5, requestType: 'interest', proposedAmount: null, requestStatus: 'rejected', requestedAt: '2026-08-17T11:00:00Z' },
    ],
    acceptedStudent: { id: 'u23', name: 'Aman Khanna', initials: 'AK', agreedAmount: 200 },
    postedAt: '2026-08-16T08:00:00Z',
  },
  {
    id: 'JG-1003',
    title: 'Video Editing for Farewell',
    description: 'Edit a 10-minute farewell video with transitions, music, and photo montage.',
    category: 'VIDEO',
    skillRequired: 'Video Editing',
    amount: 500,
    deadline: '2026-08-15',
    status: 'in-progress',
    interestedStudents: [
      { id: 'u25', name: 'Riya Kapoor', initials: 'RK', skills: ['Video Editing', 'Motion Graphics'], rating: 4.9, requestType: 'interest', proposedAmount: null, requestStatus: 'accepted', requestedAt: '2026-08-10T10:00:00Z' },
    ],
    acceptedStudent: { id: 'u25', name: 'Riya Kapoor', initials: 'RK', agreedAmount: 500 },
    postedAt: '2026-08-08T08:00:00Z',
  },
  {
    id: 'JG-1004',
    title: 'Website UI Redesign',
    description: 'Redesign our college club website with a modern look. 5 pages.',
    category: 'DESIGN',
    skillRequired: 'UI Design',
    amount: 800,
    deadline: '2026-07-28',
    status: 'completed',
    interestedStudents: [
      { id: 'u26', name: 'Diya Sharma', initials: 'DS', skills: ['UI Design', 'React'], rating: 4.9, requestType: 'interest', proposedAmount: null, requestStatus: 'accepted', requestedAt: '2026-07-10T10:00:00Z' },
    ],
    acceptedStudent: { id: 'u26', name: 'Diya Sharma', initials: 'DS', agreedAmount: 800 },
    postedAt: '2026-07-05T08:00:00Z',
  },
  {
    id: 'JG-1005',
    title: 'Arduino Circuit Wiring',
    description: 'Need help wiring an Arduino-based weather station.',
    category: 'OTHER',
    skillRequired: 'Arduino',
    amount: 200,
    deadline: '2026-06-25',
    status: 'cancelled',
    interestedStudents: [],
    acceptedStudent: null,
    postedAt: '2026-06-15T08:00:00Z',
  },
];

// ─── My Requests (Jugaads where I sent interest/bargain) ─────────────
export const mockMyRequests = [
  {
    id: 'req1',
    jugaadId: 'JG-2001',
    jugaadTitle: 'Need a React Developer for Event Website',
    category: 'CODE',
    poster: { id: 'u10', name: 'Arjun Mehta', initials: 'AM' },
    amount: 500,
    requestType: 'interest',
    status: 'waiting',
    proposedAmount: null,
    requestedAt: '2026-08-22T09:00:00Z',
  },
  {
    id: 'req2',
    jugaadId: 'JG-2002',
    jugaadTitle: 'Design a Logo for Our Startup',
    category: 'DESIGN',
    poster: { id: 'u11', name: 'Priya Sharma', initials: 'PS' },
    amount: 300,
    requestType: 'bargain',
    status: 'negotiating',
    proposedAmount: 350,
    requestedAt: '2026-08-22T07:00:00Z',
    negotiationHistory: [
      { from: 'me', amount: 300, message: '', timestamp: '2026-08-22T07:00:00Z' },
      { from: 'poster', amount: 320, message: 'I can do ₹320, that\'s my best offer.', timestamp: '2026-08-22T08:00:00Z' },
    ],
  },
  {
    id: 'req3',
    jugaadId: 'JG-2008',
    jugaadTitle: 'C++ Data Structures Problem Set',
    category: 'CODE',
    poster: { id: 'u17', name: 'Nisha Gupta', initials: 'NG' },
    amount: 350,
    requestType: 'interest',
    status: 'accepted',
    proposedAmount: null,
    requestedAt: '2026-08-19T10:00:00Z',
    acceptedAt: '2026-08-20T14:00:00Z',
    agreedAmount: 350,
    conversationId: 'conv1',
  },
  {
    id: 'req4',
    jugaadId: 'JG-2004',
    jugaadTitle: 'DBMS Assignment — Normalization Help',
    category: 'ACADEMICS',
    poster: { id: 'u13', name: 'Sneha Reddy', initials: 'SR' },
    amount: 150,
    requestType: 'interest',
    status: 'rejected',
    proposedAmount: null,
    requestedAt: '2026-08-20T12:00:00Z',
    rejectedAt: '2026-08-21T09:00:00Z',
  },
  {
    id: 'req5',
    jugaadId: 'JG-2003',
    jugaadTitle: 'Edit a 3-Minute Promo Video',
    category: 'VIDEO',
    poster: { id: 'u12', name: 'Karan Singh', initials: 'KS' },
    amount: 650,
    requestType: 'bargain',
    status: 'price-agreed',
    proposedAmount: 600,
    requestedAt: '2026-08-21T16:00:00Z',
    negotiationHistory: [
      { from: 'me', amount: 550, message: 'I can do it for ₹550.', timestamp: '2026-08-21T16:00:00Z' },
      { from: 'poster', amount: 600, message: 'Meet me at ₹600 and I\'ll accept.', timestamp: '2026-08-21T17:00:00Z' },
      { from: 'me', amount: 600, message: 'Deal.', timestamp: '2026-08-21T17:30:00Z' },
    ],
    agreedAmount: 600,
    conversationId: 'conv2',
  },
];

// ─── Conversations (only for accepted requests) ──────────────────────
export const mockConversations = [
  {
    id: 'conv1',
    jugaadId: 'JG-2008',
    jugaadTitle: 'C++ Data Structures Problem Set',
    otherUser: { id: 'u17', name: 'Nisha Gupta', initials: 'NG' },
    agreedAmount: 350,
    status: 'in-progress',
    messages: [
      { id: 'msg1', from: 'u17', text: 'Hi! I saw your interest in the C++ problem set. I can start right away.', timestamp: '2026-08-20T15:00:00Z' },
      { id: 'msg2', from: 'me', text: 'Great! I have the problems ready. Should I share them here?', timestamp: '2026-08-20T15:05:00Z' },
      { id: 'msg3', from: 'u17', text: 'Yes, please share them. I\'ll have the solutions ready by tomorrow.', timestamp: '2026-08-20T15:10:00Z' },
    ],
  },
  {
    id: 'conv2',
    jugaadId: 'JG-2003',
    jugaadTitle: 'Edit a 3-Minute Promo Video',
    otherUser: { id: 'u12', name: 'Karan Singh', initials: 'KS' },
    agreedAmount: 600,
    status: 'accepted',
    messages: [
      { id: 'msg4', from: 'u12', text: 'Price agreed at ₹600. I\'ll send the raw footage via Drive.', timestamp: '2026-08-21T18:00:00Z' },
      { id: 'msg5', from: 'me', text: 'Perfect. Send it over and I\'ll get started tonight.', timestamp: '2026-08-21T18:05:00Z' },
    ],
  },
];

// ─── Notifications ───────────────────────────────────────────────────
export const mockDashboardNotifications = [
  { id: 'ntf1', type: 'interest-received', text: 'Kabir Malhotra is interested in your Fest Poster Design', jugaadId: 'JG-1001', unread: true, timestamp: '2026-08-21T10:00:00Z', emoji: '🔔' },
  { id: 'ntf2', type: 'bargain-received', text: 'Diya Mehta sent a bargain offer of ₹350 on Fest Poster Design', jugaadId: 'JG-1001', unread: true, timestamp: '2026-08-21T14:00:00Z', emoji: '💬' },
  { id: 'ntf3', type: 'request-accepted', text: 'Nisha Gupta accepted your request for C++ Data Structures Problem Set', jugaadId: 'JG-2008', unread: true, timestamp: '2026-08-20T14:00:00Z', emoji: '🎉' },
  { id: 'ntf4', type: 'counter-offer', text: 'Priya Sharma countered your offer with ₹320 on Logo Design', jugaadId: 'JG-2002', unread: true, timestamp: '2026-08-22T08:00:00Z', emoji: '🔄' },
  { id: 'ntf5', type: 'request-rejected', text: 'Sneha Reddy declined your request for DBMS Assignment', jugaadId: 'JG-2004', unread: false, timestamp: '2026-08-21T09:00:00Z', emoji: '✕' },
  { id: 'ntf6', type: 'price-agreed', text: 'Price agreed at ₹600 with Karan Singh for Promo Video', jugaadId: 'JG-2003', unread: false, timestamp: '2026-08-21T17:30:00Z', emoji: '🤝' },
  { id: 'ntf7', type: 'new-message', text: 'Nisha Gupta sent you a new message', conversationId: 'conv1', unread: false, timestamp: '2026-08-20T15:10:00Z', emoji: '💬' },
  { id: 'ntf8', type: 'jugaad-completed', text: 'Website UI Redesign was marked as completed', jugaadId: 'JG-1004', unread: false, timestamp: '2026-07-28T16:00:00Z', emoji: '✅' },
];

// ─── Dashboard summary stats ─────────────────────────────────────────
export const mockDashboardStats = {
  recommendedJugaads: 10,
  myActiveJugaads: 3,
  requestsReceived: 3,
  myRequests: 5,
  activeCollaborations: 2,
  unreadMessages: 3,
  completedJugaads: 1,
};

// ─── Helper: time ago ────────────────────────────────────────────────
export function timeAgo(isoString) {
  const now = new Date('2026-08-22T12:00:00Z');
  const then = new Date(isoString);
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return then.toLocaleDateString();
}

// ─── Helper: days until deadline ─────────────────────────────────────
export function daysUntil(dateStr) {
  const now = new Date('2026-08-22T12:00:00Z');
  const deadline = new Date(dateStr);
  const diffMs = deadline - now;
  const diffDay = Math.ceil(diffMs / 86400000);
  if (diffDay < 0) return 'overdue';
  if (diffDay === 0) return 'today';
  if (diffDay === 1) return '1 day left';
  return `${diffDay} days left`;
}

// ─── Category colors ─────────────────────────────────────────────────
export const CATEGORY_COLORS = {
  CODE: 'mint',
  DESIGN: 'amber',
  VIDEO: 'coral',
  ACADEMICS: 'mint',
  PRESENTATION: 'amber',
  OTHER: 'coral',
};

// ─── Jugaad status config ────────────────────────────────────────────
export const JUGAAD_STATUS = {
  'open': { color: 'coral', label: 'OPEN' },
  'receiving-requests': { color: 'amber', label: 'RECEIVING REQUESTS' },
  'assigned': { color: 'mint', label: 'ASSIGNED' },
  'in-progress': { color: 'amber', label: 'IN PROGRESS' },
  'completed': { color: 'mint', label: 'COMPLETED' },
  'cancelled': { color: 'coral', label: 'CANCELLED' },
};

// ─── Request status config ───────────────────────────────────────────
export const REQUEST_STATUS = {
  'waiting': { color: 'amber', label: 'WAITING' },
  'accepted': { color: 'mint', label: 'ACCEPTED' },
  'rejected': { color: 'coral', label: 'REJECTED' },
  'negotiating': { color: 'amber', label: 'NEGOTIATING' },
  'price-agreed': { color: 'mint', label: 'PRICE AGREED' },
  'in-progress': { color: 'amber', label: 'IN PROGRESS' },
  'completed': { color: 'mint', label: 'COMPLETED' },
  'pending': { color: 'amber', label: 'PENDING' },
};

// ─── Profile data (extends mockUser from workshopMockData) ───────────
export const mockProfileData = {
  bio: 'Frontend developer who loves building useful campus projects.',
  location: 'Greater Noida, UP',
  branch: 'CSE-AI',
  year: '2nd Year',
  profileCompletion: 75,
  completionHint: 'Add your GitHub and portfolio to complete your profile.',
};

export const mockProfileLinks = [
  { id: 'lnk1', platform: 'LinkedIn', url: 'https://linkedin.com/in/ruchika-chaudhary', icon: 'linkedin' },
  { id: 'lnk2', platform: 'GitHub', url: 'https://github.com/ruchika-codes', icon: 'github' },
  { id: 'lnk3', platform: 'Portfolio', url: 'https://ruchika.dev', icon: 'globe' },
];

export const mockProfileProjects = [
  { id: 'prj1', name: 'Campus Event Portal', description: 'A full-stack event management portal for college fests with registration, scheduling, and live updates.', technologies: ['React', 'Node.js', 'MongoDB'], link: 'https://github.com/ruchika-codes/campus-event-portal', github: 'https://github.com/ruchika-codes/campus-event-portal' },
  { id: 'prj2', name: 'Study Group Finder', description: 'An app that matches students with similar study schedules and subjects for collaborative learning.', technologies: ['React', 'Supabase'], link: '', github: 'https://github.com/ruchika-codes/study-group-finder' },
];

export const mockProfileCertifications = [
  { id: 'cert1', title: 'Meta Frontend Developer', organization: 'Coursera', date: '2026-06', link: 'https://coursera.org/verify/meta-frontend' },
  { id: 'cert2', title: 'JavaScript Algorithms & Data Structures', organization: 'freeCodeCamp', date: '2026-03', link: 'https://freecodecamp.org/cert/ruchika' },
];

export const mockProfileStats = {
  jugaadsPosted: 5,
  jugaadsCompleted: 18,
  jugaadsAccepted: 4,
  rating: 4.9,
  totalEarnings: 2400,
};

// ─── Settings data ────────────────────────────────────────────────────
export const mockSettings = {
  notifications: {
    jugaadRecommendations: true,
    newInterestRequests: true,
    requestAccepted: true,
    requestRejected: true,
    bargainOffers: true,
    counterOffers: true,
    messages: true,
    jugaadUpdates: true,
    completionNotifications: true,
    emailNotifications: false,
    inAppNotifications: true,
  },
  privacy: {
    profileVisibility: 'campus-only',
    showEmail: false,
    showPhone: false,
    showSocialLinks: true,
    showSkills: true,
    showCompletedJugaads: true,
    allowInterestRequests: true,
    allowMessagesAfterAcceptance: true,
  },
  appearance: {
    theme: 'dark',
    reduceMotion: false,
  },
  preferences: {
    preferredCategories: ['CODE', 'DESIGN', 'ACADEMICS'],
    preferredSkills: ['React', 'Python', 'UI Design'],
    preferredWorkType: 'remote',
    preferredBudgetRange: '500-1000',
    notificationFrequency: 'instant',
  },
  accessibility: {
    largerText: false,
    highContrast: false,
    keyboardNavigation: true,
  },
};

export const LINK_PLATFORMS = [
  'LinkedIn', 'GitHub', 'Portfolio', 'Resume', 'Personal Website',
  'Behance', 'LeetCode', 'CodeChef', 'Codeforces', 'Instagram', 'Other',
];

export const PREFERRED_CATEGORIES = [
  'CODE', 'DESIGN', 'ACADEMICS', 'PRESENTATION', 'VIDEO', 'OTHER',
];

export const BUDGET_RANGES = [
  { value: 'under-500', label: 'Under ₹500' },
  { value: '500-1000', label: '₹500 – ₹1000' },
  { value: '1000+', label: '₹1000+' },
];

export const WORK_TYPES = [
  { value: 'remote', label: 'Remote' },
  { value: 'on-campus', label: 'On Campus' },
  { value: 'either', label: 'Either' },
];

export const NOTIF_FREQUENCIES = [
  { value: 'instant', label: 'Instant' },
  { value: 'daily', label: 'Daily Digest' },
  { value: 'weekly', label: 'Weekly Digest' },
];

export const PROFILE_VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'campus-only', label: 'Campus Only' },
  { value: 'private', label: 'Private' },
];
