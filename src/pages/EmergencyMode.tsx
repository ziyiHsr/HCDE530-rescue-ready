import { useEffect } from 'react';
import { Phone, Heart, Users, Zap, CheckCircle, ArrowLeft, Timer, Map } from 'lucide-react';
import { AEDLocation, Page, RescueSession, UserLocation } from '../types';
import { formatTime } from '../utils';
import { useState } from 'react';

interface EmergencyModeProps {
  onNavigate: (page: Page) => void;
  onComplete: (session: RescueSession) => void;
  userLocation: UserLocation | null;
  nearestAED: AEDLocation | null;
  elapsed: number;
  onTimerStart: () => void;
}

type Step = {
  id: string;
  icon: React.ReactNode;
  title: string;
  detail: string;
  color: string;
  bgColor: string;
};

export default function EmergencyMode({
  onNavigate,
  onComplete,
  userLocation,
  nearestAED,
  elapsed,
  onTimerStart,
}: EmergencyModeProps) {
  const [session] = useState<RescueSession>(() => ({
    startTime: new Date(),
    aedFound: false,
    calledEmergency: false,
    startedCompressions: false,
  }));

  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set());
  const [aedFound, setAEDFound] = useState(false);
  const [aedFoundTime, setAEDFoundTime] = useState<Date | null>(null);
  const [calledTime, setCalledTime] = useState<Date | null>(null);
  const [compressionsTime, setCompressionsTime] = useState<Date | null>(null);

  // Start the shared timer when this page mounts
  useEffect(() => {
    onTimerStart();
  }, []);

  const toggleStep = (id: string) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        if (id === 'call911' && !calledTime) setCalledTime(new Date());
        if (id === 'compressions' && !compressionsTime) setCompressionsTime(new Date());
      }
      return next;
    });
  };

  const handleAEDFound = () => {
    setAEDFound(true);
    setAEDFoundTime(new Date());
    setCheckedSteps((prev) => new Set([...prev, 'retrieve']));
  };

  const handleFinish = () => {
    const finalSession: RescueSession = {
      startTime: session.startTime,
      aedFound,
      aedFoundTime: aedFoundTime ?? undefined,
      calledEmergency: checkedSteps.has('call911'),
      calledEmergencyTime: calledTime ?? undefined,
      startedCompressions: checkedSteps.has('compressions'),
      startedCompressionsTime: compressionsTime ?? undefined,
    };
    onComplete(finalSession);
  };

  const steps: Step[] = [
    {
      id: 'call911',
      icon: <Phone className="w-6 h-6" />,
      title: 'Call 911 Now',
      detail: 'Stay on the line. Give your location. Tell them someone is unresponsive.',
      color: 'text-red-400',
      bgColor: 'bg-red-500/15 border-red-500/30',
    },
    {
      id: 'compressions',
      icon: <Heart className="w-6 h-6" />,
      title: 'Begin Chest Compressions',
      detail: 'Push hard and fast in the center of the chest. 100–120 per minute. Let chest fully recoil.',
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/15 border-pink-500/30',
    },
    {
      id: 'retrieve',
      icon: <Users className="w-6 h-6" />,
      title: 'Send Someone for the AED',
      detail: nearestAED
        ? `Nearest AED: ${nearestAED.name ?? 'AED'} ${nearestAED.address ? `— ${nearestAED.address}` : ''}`
        : 'Ask a bystander to locate and retrieve the nearest AED immediately.',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/15 border-blue-500/30',
    },
    {
      id: 'useaed',
      icon: <Zap className="w-6 h-6" />,
      title: 'Use the AED',
      detail: 'Turn on the AED and follow its voice instructions exactly. Continue CPR until it says to stop.',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/15 border-amber-500/30',
    },
  ];

  return (
    <div className="h-full bg-slate-900 flex flex-col">
      {/* Emergency Header */}
      <header className="bg-red-600 px-4 pb-4 shrink-0" style={{ paddingTop: 'max(1rem, calc(var(--sat) + 0.75rem))' }}>
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => onNavigate('home')}
            className="p-1.5 rounded-lg bg-red-700/50 text-red-100 hover:bg-red-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 bg-red-700/50 px-3 py-1.5 rounded-xl">
            <Timer className="w-4 h-4 text-red-200" />
            <span className="text-white font-mono font-bold text-lg tabular-nums">
              {formatTime(elapsed)}
            </span>
          </div>
          <div className="w-8" />
        </div>
        <div className="text-center">
          <p className="text-red-100 font-extrabold text-xl tracking-wide uppercase">Emergency Mode</p>
          <p className="text-red-200 text-xs mt-0.5">Follow each step in order</p>
        </div>
      </header>

      {/* Steps */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {steps.map((step, i) => {
          const checked = checkedSteps.has(step.id);
          const isRetrieve = step.id === 'retrieve';
          return (
            <div
              key={step.id}
              className={`rounded-2xl border transition-all duration-150 ${
                checked ? 'bg-emerald-500/10 border-emerald-500/40' : step.bgColor
              }`}
            >
              <button
                onClick={() => toggleStep(step.id)}
                className="w-full text-left p-4 active:scale-[0.98]"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    checked ? 'bg-emerald-500 text-white' : `bg-slate-700 ${step.color}`
                  }`}>
                    {checked ? <CheckCircle className="w-5 h-5" /> : step.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-500 text-xs font-bold">STEP {i + 1}</span>
                      {checked && (
                        <span className="text-emerald-400 text-xs font-semibold">Done</span>
                      )}
                    </div>
                    <p className={`font-bold text-base ${checked ? 'text-emerald-300' : 'text-white'}`}>
                      {step.title}
                    </p>
                    <p className="text-slate-400 text-sm mt-1 leading-relaxed">{step.detail}</p>
                  </div>
                </div>
              </button>

              {/* "View AED Map" button only on Step 3 */}
              {isRetrieve && (
                <div className="px-4 pb-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); onNavigate('emergency-map'); }}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
                  >
                    <Map className="w-4 h-4" />
                    View AED Map
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* CPR Rhythm Helper */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
          <p className="text-slate-300 font-semibold text-sm mb-2">CPR Compression Rate</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Heart className="w-4 h-4 text-red-400" />
            <p className="text-slate-400 text-xs">
              Sing "Stayin' Alive" by Bee Gees to maintain the correct 100–120 BPM rhythm.
            </p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-700 rounded-lg p-2 text-center">
              <p className="text-white font-bold text-base">2"</p>
              <p className="text-slate-400">Compression depth</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-2 text-center">
              <p className="text-white font-bold text-base">110 BPM</p>
              <p className="text-slate-400">Target rate</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Actions */}
      <footer className="shrink-0 px-4 pt-3 space-y-2 border-t border-slate-800 footer-safe">
        {!aedFound ? (
          <button
            onClick={handleAEDFound}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl text-base transition-colors active:scale-95 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            AED Found & In Use
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl py-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-300 font-semibold">AED in use — follow device instructions</span>
          </div>
        )}
        <button
          onClick={handleFinish}
          className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-3 rounded-2xl text-sm transition-colors active:scale-95"
        >
          End & View Summary
        </button>
      </footer>
    </div>
  );
}
