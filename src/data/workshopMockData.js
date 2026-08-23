// Centralized mock data for the Jugaad Workshop dashboard.
// Structured to match backend models so it can be swapped with API responses later.

export const mockUser = {
  id: 'u1',
  name: 'Ruchika Chaudhary',
  email: 'demo@campusjugaad.com',
  role: 'student',
  college: 'GL Bajaj Institute of Technology and Management',
  department: 'CSE-AI',
  year: '2nd Year',
  jugaadScore: 850,
  jugaadsCompleted: 18,
  rating: 4.9,
  avatar: 'RC',
};

export const mockStats = {
  open: 3,
  inProgress: 1,
  completed: 12,
  totalRequests: 16,
  totalMatches: 4,
  helpedStudents: 25,
  activeMatches: 4,
};

export const mockTasks = [
  { id: 'JG-1024', text: 'Need a fest poster', emoji: '🖼️', tag: 'DESIGN', status: 'matched', budget: '₹300', assignee: 'Kabir', date: '2h ago' },
  { id: 'JG-1023', text: 'Fix C++ segmentation fault', emoji: '🐛', tag: 'CODE', status: 'completed', budget: '₹200', assignee: 'Aman', date: '1d ago' },
  { id: 'JG-1022', text: 'Edit farewell video', emoji: '🎬', tag: 'VIDEO', status: 'in-progress', budget: '₹500', assignee: 'Riya', date: '3h ago' },
  { id: 'JG-1021', text: 'DBMS notes unit 3', emoji: '📚', tag: 'ACADEMICS', status: 'open', budget: '₹150', assignee: null, date: '5h ago' },
  { id: 'JG-1020', text: 'Design PPT for tomorrow', emoji: '⏰', tag: 'PRESENTATION', status: 'open', budget: '₹250', assignee: null, date: '6h ago' },
  { id: 'JG-1019', text: 'Arduino circuit wiring', emoji: '🔌', tag: 'OTHER', status: 'open', budget: '₹200', assignee: null, date: '8h ago' },
];

// My Jugaads — with dates for year/month filtering
export const mockMyJugaads = [
  { id: 'JG-1024', text: 'Fest Poster', emoji: '🖼️', tag: 'DESIGN', status: 'completed', budget: '₹300', assignee: 'Kabir', date: '2026-08-15' },
  { id: 'JG-1023', text: 'C++ Debugging', emoji: '🐛', tag: 'CODE', status: 'in-progress', budget: '₹200', assignee: 'Aman', date: '2026-08-12' },
  { id: 'JG-1022', text: 'Video Editing', emoji: '🎬', tag: 'VIDEO', status: 'completed', budget: '₹500', assignee: 'Riya', date: '2026-08-05' },
  { id: 'JG-1021', text: 'PPT Design', emoji: '⏰', tag: 'PRESENTATION', status: 'completed', budget: '₹250', assignee: 'Ananya', date: '2026-07-28' },
  { id: 'JG-1020', text: 'DBMS Notes', emoji: '📚', tag: 'ACADEMICS', status: 'completed', budget: '₹150', assignee: 'Dev', date: '2026-07-15' },
  { id: 'JG-1019', text: 'Arduino Wiring', emoji: '🔌', tag: 'OTHER', status: 'cancelled', budget: '₹200', assignee: null, date: '2026-06-20' },
  { id: 'JG-1018', text: 'Website UI', emoji: '💻', tag: 'DESIGN', status: 'completed', budget: '₹800', assignee: 'Diya', date: '2026-06-10' },
  { id: 'JG-1017', text: 'Photoshop Edit', emoji: '🎨', tag: 'DESIGN', status: 'completed', budget: '₹400', assignee: 'Kabir', date: '2026-06-05' },
];

export const mockSkills = [
  { id: 's1', name: 'C++', level: 'Advanced', category: 'CODE', proficiency: 90 },
  { id: 's2', name: 'Python', level: 'Intermediate', category: 'CODE', proficiency: 65 },
  { id: 's3', name: 'UI Design', level: 'Advanced', category: 'DESIGN', proficiency: 85 },
  { id: 's4', name: 'Video Editing', level: 'Intermediate', category: 'VIDEO', proficiency: 70 },
];

export const mockMatches = [
  { id: 'm1', name: 'Riya', skill: 'Video Editor', rating: 4.9, completed: 17, tag: 'VIDEO', initials: 'Ri', accent: 'amber' },
  { id: 'm2', name: 'Dev', skill: 'C++ / Debugging', rating: 4.7, completed: 19, tag: 'CODE', initials: 'De', accent: 'mint' },
  { id: 'm3', name: 'Ananya', skill: 'Graphic Design', rating: 4.8, completed: 22, tag: 'DESIGN', initials: 'An', accent: 'coral' },
  { id: 'm4', name: 'Kabir', skill: 'Poster Artist', rating: 4.7, completed: 12, tag: 'DESIGN', initials: 'Ka', accent: 'amber' },
  { id: 'm5', name: 'Diya', skill: 'Photoshop Wizard', rating: 4.9, completed: 28, tag: 'DESIGN', initials: 'Di', accent: 'mint' },
];

export const mockAchievements = [
  { id: 'a1', title: 'First Jugaad', emoji: '🎯', desc: 'Completed your first exchange', unlocked: true, tier: 'bronze' },
  { id: 'a2', title: '10 Jugaads', emoji: '🔟', desc: 'Completed 10 exchanges', unlocked: true, tier: 'silver' },
  { id: 'a3', title: 'Campus Helper', emoji: '🤝', desc: 'Helped students across campus', unlocked: true, tier: 'gold' },
  { id: 'a4', title: 'Jugaad Hero', emoji: '🏆', desc: 'Top 10 contributors on campus', unlocked: true, tier: 'gold' },
  { id: 'a5', title: 'Speed Demon', emoji: '⚡', desc: 'Delivered a Jugaad in under 1 hour', unlocked: false, tier: 'platinum' },
  { id: 'a6', title: '100 Jugaads', emoji: '💯', desc: 'Complete 100 exchanges', unlocked: false, tier: 'platinum' },
];

export const mockActivity = [
  { id: 'act1', text: 'New video editing request', emoji: '🎬', time: 'just now', type: 'request' },
  { id: 'act2', text: 'C++ problem matched', emoji: '🐛', time: '2m ago', type: 'match' },
  { id: 'act3', text: 'Poster Jugaad completed', emoji: '🖼️', time: '5m ago', type: 'done' },
  { id: 'act4', text: 'New student joined the exchange', emoji: '👋', time: '8m ago', type: 'join' },
  { id: 'act5', text: 'PPT request accepted', emoji: '⏰', time: '12m ago', type: 'accept' },
  { id: 'act6', text: 'DBMS notes shared', emoji: '📚', time: '18m ago', type: 'done' },
];

export const mockEarnings = {
  totalEarned: 2400,
  thisMonth: 800,
  recent: [
    { id: 'e1', text: 'Poster Design', amount: 800, date: '2d ago', emoji: '🖼️' },
    { id: 'e2', text: 'Video Editing', amount: 1200, date: '1d ago', emoji: '🎬' },
    { id: 'e3', text: 'Notes', amount: 400, date: '5d ago', emoji: '📚' },
  ],
};

export const mockNotes = [
  { id: 'n1', text: 'Prepare Hackathon' },
  { id: 'n2', text: 'Finish DBMS Assignment' },
  { id: 'n3', text: 'Update Portfolio' },
];

export const mockNotifications = [
  { id: 'nf1', text: 'New Jugaad request received', time: '2m ago', unread: true, emoji: '🔔' },
  { id: 'nf2', text: 'Your task was accepted', time: '15m ago', unread: true, emoji: '✅' },
  { id: 'nf3', text: 'Riya accepted your request', time: '1h ago', unread: true, emoji: '🤝' },
  { id: 'nf4', text: 'Payment received', time: '3h ago', unread: false, emoji: '💰' },
  { id: 'nf5', text: 'New campus activity', time: '5h ago', unread: false, emoji: '📢' },
];

export const mockConversations = [
  { id: 'c1', from: 'Riya', initials: 'Ri', preview: 'Can you help with this video?', time: '2m ago', unread: true, accent: 'amber' },
  { id: 'c2', from: 'Dev', initials: 'De', preview: 'Your C++ issue is fixed.', time: '1h ago', unread: false, accent: 'mint' },
  { id: 'c3', from: 'Ananya', initials: 'An', preview: 'Poster is ready!', time: '3h ago', unread: false, accent: 'coral' },
  { id: 'c4', from: 'Kabir', initials: 'Ka', preview: 'Thanks for the help!', time: '1d ago', unread: false, accent: 'amber' },
];

export const TASK_CATEGORIES = [
  'CODE', 'DESIGN', 'VIDEO', 'ACADEMICS', 'PRESENTATION', 'OTHER',
];

export const SEARCH_CATEGORIES = [
  'CODE', 'DESIGN', 'VIDEO', 'ACADEMICS', 'PRESENTATION', 'OTHER',
];

export const SEARCH_SUGGESTIONS = [
  'C++ debugging', 'Video editing', 'Poster design', 'PPT', 'Notes', 'Website development',
];

export const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

export const STATUS_OPTIONS = ['ALL', 'OPEN', 'IN PROGRESS', 'COMPLETED', 'CANCELLED'];
