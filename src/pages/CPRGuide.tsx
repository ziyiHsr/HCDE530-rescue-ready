import { ArrowLeft, Heart, Activity, Zap, Phone } from 'lucide-react';
import { Page } from '../types';

interface CPRGuideProps {
  onNavigate: (page: Page) => void;
}

export default function CPRGuide({ onNavigate }: CPRGuideProps) {
  return (
    <div className="h-full bg-slate-900 flex flex-col">
      {/* Header */}
      <header
        className="px-4 pb-4 bg-slate-900 border-b border-slate-800 shrink-0"
        style={{ paddingTop: 'max(1rem, calc(var(--sat) + 0.75rem))' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 active:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">CPR Quick Guide</h1>
            <p className="text-slate-400 text-xs">Fast-reference — scan in under 60 seconds</p>
          </div>
        </div>
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto px-4 py-5 space-y-4">

        {/* Section 1 — Recognize Cardiac Arrest */}
        <section>
          <SectionLabel>1 — Recognize Cardiac Arrest</SectionLabel>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 space-y-2.5">
            <CheckRow text="Person is unresponsive" />
            <CheckRow text="Person is not breathing normally" />
            <CheckRow text="Gasping is NOT normal breathing" alert />
            <CheckRow text="Call emergency services immediately" alert />
          </div>
        </section>

        {/* Section 2 — Chest Compressions */}
        <section>
          <SectionLabel>2 — Start Chest Compressions</SectionLabel>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 space-y-2.5 mb-3">
            <CheckRow text="Place hands in the center of the chest" />
            <CheckRow text="Push hard and fast" />
            <CheckRow text="Allow full chest recoil between compressions" />
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-500/15 border border-red-500/40 rounded-2xl p-4 text-center">
              <Activity className="w-5 h-5 text-red-400 mx-auto mb-1.5" />
              <p className="text-red-300 text-2xl font-extrabold leading-none">100–120</p>
              <p className="text-red-400/70 text-xs font-semibold mt-1 uppercase tracking-wide">BPM</p>
            </div>
            <div className="bg-red-500/15 border border-red-500/40 rounded-2xl p-4 text-center">
              <Heart className="w-5 h-5 text-red-400 mx-auto mb-1.5" />
              <p className="text-red-300 text-2xl font-extrabold leading-none">2 in</p>
              <p className="text-red-400/70 text-xs font-semibold mt-1 uppercase tracking-wide">5 cm depth</p>
            </div>
          </div>
        </section>

        {/* Section 3 — AED Instructions */}
        <section>
          <SectionLabel>3 — AED Instructions</SectionLabel>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 space-y-2.5">
            <StepRow n={1} text="Turn on the AED" />
            <StepRow n={2} text="Follow voice prompts" />
            <StepRow n={3} text="Apply pads as shown on the diagram" />
            <StepRow n={4} text="Stand clear during analysis" />
            <StepRow n={5} text="Deliver shock if instructed" />
            <StepRow n={6} text="Resume CPR immediately afterward" />
          </div>
        </section>

        {/* Section 4 — Rhythm Reminder */}
        <section>
          <SectionLabel>4 — Rhythm Reminder</SectionLabel>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-base">"Stayin' Alive"</p>
                <p className="text-slate-400 text-sm">Bee Gees</p>
                <p className="text-red-400 text-xs font-semibold mt-1 uppercase tracking-wide">≈ 103 BPM</p>
              </div>
              {/* Pulse animation */}
              <div className="flex items-end gap-1 h-8">
                {[3, 6, 4, 8, 5, 7, 3, 6].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-red-500 rounded-full"
                    style={{
                      height: `${h * 4}px`,
                      animation: `pulse-bar 0.6s ease-in-out ${i * 0.075}s infinite alternate`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 — Emergency Reminder */}
        <section>
          <SectionLabel>5 — Emergency Reminder</SectionLabel>
          <div className="bg-red-500/15 border border-red-500/50 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Phone className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-red-300 font-bold text-sm">Call emergency services first.</p>
            </div>
            <p className="text-red-300/80 text-sm leading-relaxed pl-6">
              Use an AED as soon as one becomes available.
            </p>
            <p className="text-red-300/80 text-sm leading-relaxed pl-6">
              Continue CPR until professional help arrives.
            </p>
          </div>
        </section>

        <div className="h-2" />
      </main>

      {/* Footer */}
      <footer className="shrink-0 px-4 pt-3 border-t border-slate-800 footer-safe">
        <div className="flex items-start gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-slate-500 text-xs leading-relaxed">
            This guide is for reference only and does not replace certified CPR training.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes pulse-bar {
          from { transform: scaleY(0.4); opacity: 0.5; }
          to   { transform: scaleY(1);   opacity: 1;   }
        }
      `}</style>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 px-1">
      {children}
    </p>
  );
}

function CheckRow({ text, alert }: { text: string; alert?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${alert ? 'bg-red-500' : 'bg-slate-500'}`} />
      <span className={`text-sm leading-snug ${alert ? 'text-red-300 font-semibold' : 'text-slate-300'}`}>
        {text}
      </span>
    </div>
  );
}

function StepRow({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-red-400 text-xs font-bold">{n}</span>
      </div>
      <span className="text-slate-300 text-sm leading-snug">{text}</span>
    </div>
  );
}
