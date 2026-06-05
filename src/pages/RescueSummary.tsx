import { CheckCircle, XCircle, Clock, Heart, Phone, Users, Home, RotateCcw } from 'lucide-react';
import { Page, RescueSession } from '../types';

interface RescueSummaryProps {
  session: RescueSession;
  onNavigate: (page: Page) => void;
  onReset: () => void;
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDuration(start: Date, end: Date): string {
  const s = Math.round((end.getTime() - start.getTime()) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem}s`;
}

interface TimelineEvent {
  label: string;
  time: Date;
  icon: React.ReactNode;
  color: string;
}

export default function RescueSummary({ session, onNavigate, onReset }: RescueSummaryProps) {
  const endTime = new Date();
  const totalDuration = formatDuration(session.startTime, endTime);

  const events: TimelineEvent[] = [
    {
      label: 'Emergency Mode started',
      time: session.startTime,
      icon: <Heart className="w-4 h-4" />,
      color: 'bg-red-500',
    },
  ];

  if (session.calledEmergency && session.calledEmergencyTime) {
    events.push({
      label: 'Called 911',
      time: session.calledEmergencyTime,
      icon: <Phone className="w-4 h-4" />,
      color: 'bg-blue-500',
    });
  }

  if (session.startedCompressions && session.startedCompressionsTime) {
    events.push({
      label: 'Chest compressions started',
      time: session.startedCompressionsTime,
      icon: <Heart className="w-4 h-4" />,
      color: 'bg-pink-500',
    });
  }

  if (session.aedFound && session.aedFoundTime) {
    events.push({
      label: 'AED located and in use',
      time: session.aedFoundTime,
      icon: <Users className="w-4 h-4" />,
      color: 'bg-emerald-500',
    });
  }

  events.push({
    label: 'Session ended',
    time: endTime,
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'bg-slate-500',
  });

  events.sort((a, b) => a.time.getTime() - b.time.getTime());

  const stats = [
    {
      label: 'Emergency started',
      value: formatTimestamp(session.startTime),
      icon: <Clock className="w-4 h-4" />,
    },
    {
      label: 'Total duration',
      value: totalDuration,
      icon: <Clock className="w-4 h-4" />,
    },
    {
      label: '911 called',
      value: session.calledEmergency ? 'Yes' : 'Not marked',
      icon: <Phone className="w-4 h-4" />,
      ok: session.calledEmergency,
    },
    {
      label: 'CPR started',
      value: session.startedCompressions ? 'Yes' : 'Not marked',
      icon: <Heart className="w-4 h-4" />,
      ok: session.startedCompressions,
    },
    {
      label: 'AED used',
      value: session.aedFound ? 'Yes' : 'Not found',
      icon: <Users className="w-4 h-4" />,
      ok: session.aedFound,
    },
  ];

  return (
    <div className="h-full bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="px-4 pb-4 text-center border-b border-slate-800" style={{ paddingTop: 'max(1.5rem, calc(var(--sat) + 1rem))' }}>
        <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3 ${
          session.aedFound ? 'bg-emerald-500/20' : 'bg-slate-700'
        }`}>
          {session.aedFound ? (
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          ) : (
            <XCircle className="w-8 h-8 text-slate-400" />
          )}
        </div>
        <h2 className="text-white font-extrabold text-2xl">Rescue Summary</h2>
        <p className={`text-sm mt-1 font-medium ${session.aedFound ? 'text-emerald-400' : 'text-slate-400'}`}>
          {session.aedFound ? 'AED was successfully deployed' : 'AED was not reached'}
        </p>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {/* Stats Grid */}
        <section>
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Summary</h3>
          <div className="grid grid-cols-1 gap-2">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between bg-slate-800 rounded-xl px-4 py-3 border border-slate-700"
              >
                <div className="flex items-center gap-2.5 text-slate-400">
                  {stat.icon}
                  <span className="text-sm">{stat.label}</span>
                </div>
                <span className={`text-sm font-semibold ${
                  stat.ok === true
                    ? 'text-emerald-400'
                    : stat.ok === false
                    ? 'text-slate-500'
                    : 'text-white'
                }`}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section>
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Timeline</h3>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-slate-700" />
            <div className="space-y-4">
              {events.map((event, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full ${event.color} flex items-center justify-center text-white shrink-0 relative z-10`}>
                    {event.icon}
                  </div>
                  <div className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5">
                    <p className="text-white text-sm font-medium">{event.label}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{formatTimestamp(event.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reminder */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
          <p className="text-amber-300 text-xs font-semibold uppercase tracking-wide mb-1">Reminder</p>
          <p className="text-amber-200 text-sm leading-relaxed">
            Always stay with the patient until emergency services arrive. Continue CPR if the AED advises no shock.
          </p>
        </div>
      </main>

      {/* Actions */}
      <footer className="shrink-0 px-4 pt-3 space-y-2 border-t border-slate-800 footer-safe">
        <button
          onClick={onReset}
          className="w-full bg-red-500 hover:bg-red-400 text-white font-bold py-4 rounded-2xl transition-colors active:scale-95 flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Start New Emergency
        </button>
        <button
          onClick={() => onNavigate('home')}
          className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-3 rounded-2xl text-sm transition-colors active:scale-95 flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          Return Home
        </button>
      </footer>
    </div>
  );
}
