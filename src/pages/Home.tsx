import { Heart, MapPin, Phone } from 'lucide-react';
import { Page } from '../types';

interface HomeProps {
  onNavigate: (page: Page) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 flex flex-col overflow-y-auto">
      {/* Header */}
      <header className="px-6 pt-safe pb-4" style={{ paddingTop: 'max(2rem, calc(var(--sat) + 1rem))' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl tracking-tight">Rescue Ready</h1>
            <p className="text-red-300 text-xs font-medium tracking-widest uppercase">
              Emergency Response
            </p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="text-center mb-10">
          <div className="relative inline-block mb-6">
            <div className="w-28 h-28 bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-500/40 animate-pulse">
              <div className="w-20 h-20 bg-red-500/30 rounded-full flex items-center justify-center border-2 border-red-500/60">
                <Heart className="w-9 h-9 text-red-400 fill-red-400" />
              </div>
            </div>
          </div>
          <h2 className="text-white text-4xl font-extrabold mb-3 leading-tight">
            Every Second<br />
            <span className="text-red-400">Counts</span>
          </h2>
          <p className="text-slate-400 text-base max-w-xs mx-auto leading-relaxed">
            Locate nearby AEDs instantly and get step-by-step emergency guidance when it matters most.
          </p>
        </div>

        {/* Primary Action */}
        <button
          onClick={() => onNavigate('emergency')}
          className="w-full max-w-sm bg-red-500 hover:bg-red-400 active:bg-red-600 text-white font-bold text-xl py-5 rounded-2xl shadow-2xl shadow-red-500/30 transition-all duration-150 active:scale-95 flex items-center justify-center gap-3 mb-4"
        >
          <Phone className="w-6 h-6" />
          Emergency Mode
        </button>

        {/* Secondary Action */}
        <button
          onClick={() => onNavigate('map')}
          className="w-full max-w-sm bg-white/10 hover:bg-white/15 active:bg-white/20 text-white font-semibold text-lg py-4 rounded-2xl border border-white/20 transition-all duration-150 active:scale-95 flex items-center justify-center gap-3 mb-4"
        >
          <MapPin className="w-5 h-5 text-red-400" />
          Find Nearby AED
        </button>

        {/* CPR Guide */}
        <button
          onClick={() => onNavigate('cpr')}
          className="w-full max-w-sm bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-colors active:scale-95 duration-150"
        >
          <Heart className="w-4 h-4 text-red-400" />
          <span className="text-white/60 text-sm font-medium">CPR Guide</span>
        </button>
      </main>

      {/* Disclaimer */}
      <footer className="footer-safe px-6">
        <p className="text-slate-600 text-xs text-center leading-relaxed">
          This app aids emergency response but does not replace professional medical services.
          Always call 911 first.
        </p>
      </footer>
    </div>
  );
}
