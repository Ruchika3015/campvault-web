import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { WorkshopNav } from '@/components/workshop/WorkshopNav';
import { WorkshopEngine } from '@/components/workshop/WorkshopEngine';
import { LiveExchange } from '@/components/workshop/LiveExchange';
import { FindJugaadStation } from '@/components/workshop/stations/FindJugaad';
import { PostTaskStation } from '@/components/workshop/stations/PostTask';
import { MyJugaadsStation } from '@/components/workshop/stations/MyJugaads';
import { ProfileStation } from '@/components/workshop/stations/Profile';
import { LED, Rivet } from '@/components/primitives/Details';
import { mockStats, mockTasks, mockUser } from '@/data/workshopMockData';
import {
  Search, Plus, ClipboardList, User,
  ChevronRight, Zap, Leaf, Lamp,
} from 'lucide-react';

export function DashboardPage() {
  const { user: authUser, isDemoMode } = useAuth();
  const [activeStation, setActiveStation] = useState('home');
  const [panel, setPanel] = useState(null);

  const displayName = authUser?.name || mockUser.name;

  const openPanel = (name) => {
    setPanel(name);
    setActiveStation(name);
  };

  const closePanel = () => {
    setPanel(null);
    setActiveStation('home');
  };

  return (
    <div className="min-h-screen bg-bg-0 text-ink-0 overflow-x-hidden">
      {/* Room atmosphere */}
      <div className="fixed inset-0 tech-diagram pointer-events-none opacity-40" />
      <div className="fixed inset-0 haze pointer-events-none" />
      <div className="fixed inset-0 depth-fog pointer-events-none" />
      <div className="bg-lettering fixed">WORKSHOP</div>

      <WorkshopNav active={activeStation} onSelect={(id) => id === 'home' ? closePanel() : openPanel(id)} />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Room header */}
        <section className="pt-12 sm:pt-16 pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <LED color="mint" pulse size={7} />
              <span className="font-technical text-[9px] text-ink-2">01 — THE JUGAAD WORKSHOP</span>
              <span className="h-px w-10 bg-metal-2" />
              <span className="font-technical text-[9px] text-mint">STATUS // ONLINE</span>
              {isDemoMode && (
                <span className="font-technical text-[7px] text-amber/60 px-2 py-0.5 rounded" style={{ border: '1px solid rgba(214,138,60,0.2)', background: 'rgba(214,138,60,0.04)' }}>
                  DEMO ACCOUNT
                </span>
              )}
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-tight text-ink-0">
              WELCOME TO<br />
              <span className="text-amber">THE WORKSHOP.</span>
            </h1>
            <p className="mt-4 max-w-lg text-sm text-ink-2 leading-relaxed">
              Your creative control center. Find the skill you need, drop a task into the exchange,
              and see what the campus can solve together.
            </p>
          </div>

          {/* small welcome desk display */}
          <div className="surface-wood rounded-xl p-4 min-w-[220px] relative" style={{ transform: 'rotate(1deg)' }}>
            <Rivet size={6} className="absolute top-1.5 left-1.5" />
            <Rivet size={6} className="absolute top-1.5 right-1.5" />
            <div className="flex items-center gap-2 mb-2">
              <span className="grid place-items-center w-7 h-7 rounded-full bg-amber text-bg-0 font-display text-[10px]">{authUser?.name?.slice(0, 2).toUpperCase() || mockUser.avatar}</span>
              <div>
                <p className="font-mono text-[10px] text-paper">{displayName}</p>
                <p className="font-technical text-[7px] text-paper/70">OPERATOR // ACTIVE</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LED color="mint" pulse size={5} />
              <span className="font-mono text-[8px] text-paper/80">The room is yours.</span>
            </div>
          </div>
        </section>

        {/* === Main workshop scene — engine + task chits distributed === */}
        <section className="relative min-h-[440px] sm:min-h-[480px] rounded-3xl overflow-hidden preserve-3d">
          {/* Back wall */}
          <div className="absolute inset-0 rounded-3xl surface-panel" />
          <div className="absolute inset-0 rounded-3xl" style={{ background: 'linear-gradient(135deg, rgba(214,138,60,0.04), transparent 45%, rgba(93,184,154,0.03))' }} />

          {/* Wall shelf — minimal */}
          <div className="absolute top-5 left-5 right-5 hidden sm:block">
            <div className="flex items-start gap-3">
              <ShelfObject type="books" />
              <ShelfObject type="plant" />
              <div className="flex-1" />
              <ShelfObject type="lamp" />
            </div>
            <div className="h-2 surface-wood rounded-sm mt-2" />
          </div>

          {/* === Jugaad Engine — centered === */}
          <div className="relative z-10 w-full max-w-2xl mx-auto pt-20 sm:pt-24 px-4">
            <WorkshopEngine onFind={() => openPanel('find')} onPost={() => openPanel('post')} />
          </div>

          {/* === Floating task chits — distributed around the scene === */}
          {/* Top-left background chit */}
          <div className="absolute top-20 left-4 sm:left-8 hidden md:block opacity-90">
            <FloatingChit task={mockTasks[0]} rotate={-5} depth="back" />
          </div>

          {/* Top-right background chit */}
          <div className="absolute top-16 right-4 sm:right-8 hidden md:block opacity-90">
            <FloatingChit task={mockTasks[2]} rotate={4} depth="back" />
          </div>

          {/* Bottom-left foreground chit */}
          <div className="absolute bottom-6 left-4 sm:left-8 hidden sm:block">
            <FloatingChit task={mockTasks[1]} rotate={-3} depth="front" />
          </div>

          {/* Bottom-right foreground chit */}
          <div className="absolute bottom-8 right-4 sm:right-8 hidden sm:block">
            <FloatingChit task={mockTasks[3]} rotate={3} depth="front" />
          </div>

          {/* Lower workbench edge */}
          <div className="absolute bottom-0 inset-x-0 h-16 surface-wood border-t-4 border-metal-1" />
          <div className="absolute bottom-3 left-6 font-technical text-[7px] text-paper/40">WORKBENCH // CJ-04</div>
          <div className="absolute bottom-3 right-6 flex items-center gap-2">
            <LED color="amber" pulse size={4} />
            <span className="font-mono text-[7px] text-paper/40">POWER RAIL: 98%</span>
          </div>
        </section>

        {/* === Primary actions === */}
        <section className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StationObject icon={<Search size={20} />} label="FIND A JUGAAD" sub="Search the campus" color="amber" onClick={() => openPanel('find')} />
          <StationObject icon={<Plus size={20} />} label="POST A JUGAAD" sub="Drop a request" color="mint" onClick={() => openPanel('post')} />
          <StationObject icon={<ClipboardList size={20} />} label="MY JUGAADS" sub={`${mockStats.open} open · ${mockStats.completed} done`} color="coral" onClick={() => openPanel('jugaads')} />
          <StationObject icon={<User size={20} />} label="PROFILE" sub="Your personal area" color="amber" onClick={() => openPanel('profile')} />
        </section>

        {/* === Recent activity + live exchange === */}
        <section className="mt-6 grid lg:grid-cols-[1fr_1fr] gap-6 items-start">
          <TaskBoardPreview onOpen={() => openPanel('jugaads')} />
          <LiveExchange />
        </section>

        {/* Footer room note */}
        <div className="mt-10 flex items-center justify-center gap-3">
          <span className="h-px w-16 bg-metal-2/50" />
          <span className="font-editorial text-sm text-ink-3">make something useful</span>
          <span className="h-px w-16 bg-metal-2/50" />
        </div>
      </main>

      {/* Station panels */}
      <FindJugaadStation open={panel === 'find'} onClose={closePanel} />
      <PostTaskStation open={panel === 'post'} onClose={closePanel} />
      <MyJugaadsStation open={panel === 'jugaads'} onClose={closePanel} />
      <ProfileStation open={panel === 'profile'} onClose={closePanel} />
    </div>
  );
}

function StationObject({ icon, label, sub, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="station surface-metal-brushed rounded-xl p-4 text-left min-h-[100px] flex flex-col justify-between relative"
      style={{ border: `1px solid color-mix(in srgb, var(--${color}) 22%, transparent)` }}
    >
      <div className="flex items-start justify-between">
        <span style={{ color: `var(--${color})` }}>{icon}</span>
        <ChevronRight size={13} className="text-ink-3" />
      </div>
      <div>
        <p className="font-technical text-[9px] text-ink-0">{label}</p>
        <p className="font-mono text-[9px] text-ink-2 mt-1">{sub}</p>
      </div>
      <LED color={color} pulse size={4} className="absolute top-2 right-2" />
    </button>
  );
}

function FloatingChit({ task, rotate, depth }) {
  const isBack = depth === 'back';
  return (
    <div
      className="surface-paper paper-fiber relative w-36 p-3"
      style={{
        transform: `rotate(${rotate}deg) scale(${isBack ? 0.85 : 1})`,
        clipPath: 'polygon(1% 0, 97% 1%, 100% 5%, 99% 95%, 96% 100%, 4% 99%, 0 93%, 2% 3%)',
        opacity: isBack ? 0.75 : 1,
        boxShadow: isBack ? '0 4px 8px rgba(0,0,0,0.3)' : '0 8px 16px rgba(0,0,0,0.5)',
        zIndex: isBack ? 1 : 20,
      }}
    >
      <span className="absolute -top-1 left-3 w-2.5 h-2.5 rounded-full" style={{ background: 'radial-gradient(circle at 35% 30%, #c75d5d, #8a3030)', boxShadow: '0 2px 4px rgba(0,0,0,0.4)' }} />
      <div className="flex items-start gap-2">
        <span className="text-sm leading-none">{task.emoji}</span>
        <div>
          <p className="font-editorial text-xs text-paper-ink leading-snug">{task.text}</p>
          <p className="font-mono text-[8px] text-paper-ink/60 mt-1">{task.id}</p>
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5">
        <span className="font-mono text-[7px] uppercase tracking-wider px-1.5 py-0.5 text-bg-0 rounded" style={{ background: 'var(--amber-deep)' }}>
          {task.tag}
        </span>
        <span className="font-mono text-[8px] text-paper-ink/60">{task.budget}</span>
      </div>
    </div>
  );
}

function TaskBoardPreview({ onOpen }) {
  return (
    <button onClick={onOpen} className="station surface-wood rounded-2xl p-5 text-left relative overflow-hidden">
      <Rivet size={7} className="absolute top-2 left-2" />
      <Rivet size={7} className="absolute top-2 right-2" />
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ClipboardList size={14} className="text-amber" />
          <span className="font-technical text-[9px] text-paper/90">TASK BOARD // MY JUGAADS</span>
        </div>
        <ChevronRight size={14} className="text-paper/60" />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {mockTasks.slice(0, 4).map((task, i) => (
          <div key={task.id} className="surface-paper p-3" style={{ transform: `rotate(${i % 2 ? 1.5 : -1.5}deg)`, clipPath: 'polygon(1% 0, 97% 1%, 100% 5%, 99% 95%, 96% 100%, 4% 99%, 0 93%, 2% 3%)' }}>
            <div className="flex items-start gap-2">
              <span className="text-sm">{task.emoji}</span>
              <div className="min-w-0">
                <p className="font-editorial text-xs text-paper-ink truncate">{task.text}</p>
                <p className="font-mono text-[8px] text-paper-ink/60 mt-1">{task.status === 'matched' ? 'MATCH FOUND' : task.status === 'in-progress' ? 'IN PROGRESS' : task.status.toUpperCase()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <LED color="amber" pulse size={4} />
        <span className="font-mono text-[9px] text-paper/70">click to open task board</span>
      </div>
    </button>
  );
}

function ShelfObject({ type }) {
  const objects = {
    books: <div className="flex items-end gap-1 h-12"><div className="w-4 h-10 bg-coral rounded-sm" /><div className="w-4 h-12 bg-amber rounded-sm" /><div className="w-4 h-9 bg-mint rounded-sm" /></div>,
    plant: <div className="relative h-12 w-12"><div className="absolute bottom-0 left-2 w-8 h-5 rounded-b-lg bg-amber-deep" /><Leaf size={27} className="absolute top-0 left-2 text-mint" /></div>,
    lamp: <div className="relative h-12 w-12"><Lamp size={38} className="text-amber" /><LED color="amber" pulse size={4} className="absolute top-3 left-4" /></div>,
  };
  return <div className="h-14 flex items-end">{objects[type]}</div>;
}
