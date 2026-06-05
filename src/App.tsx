import { useState, useEffect, useRef } from 'react';
import { AEDLocation, Page, RescueSession, UserLocation } from './types';
import Home from './pages/Home';
import AEDMap from './pages/AEDMap';
import EmergencyMode from './pages/EmergencyMode';
import RescueSummary from './pages/RescueSummary';
import CPRGuide from './pages/CPRGuide';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearestAED, setNearestAED] = useState<AEDLocation | null>(null);
  const [rescueSession, setRescueSession] = useState<RescueSession | null>(null);

  // Timer lives here so it keeps running even when navigating to the map mid-emergency
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const emergencyActiveRef = useRef(false);

  const startTimer = () => {
    if (timerRef.current) return;
    emergencyActiveRef.current = true;
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    emergencyActiveRef.current = false;
  };

  const handleStartEmergency = (loc: UserLocation, aed?: AEDLocation) => {
    setUserLocation(loc);
    setNearestAED(aed ?? null);
    setElapsed(0);
    stopTimer();
    setPage('emergency');
    // timer started by EmergencyMode mount via prop callback
  };

  const handleEmergencyComplete = (session: RescueSession) => {
    stopTimer();
    setRescueSession(session);
    setPage('summary');
  };

  const handleReset = () => {
    setRescueSession(null);
    setNearestAED(null);
    setElapsed(0);
    setPage('emergency');
  };

  // Clean up on unmount
  useEffect(() => () => stopTimer(), []);

  if (page === 'cpr') {
    return <CPRGuide onNavigate={setPage} />;
  }

  if (page === 'home') {
    return <Home onNavigate={setPage} />;
  }

  if (page === 'map') {
    return (
      <AEDMap
        onNavigate={setPage}
        onStartEmergency={handleStartEmergency}
      />
    );
  }

  if (page === 'emergency') {
    return (
      <EmergencyMode
        onNavigate={setPage}
        onComplete={handleEmergencyComplete}
        userLocation={userLocation}
        nearestAED={nearestAED}
        elapsed={elapsed}
        onTimerStart={startTimer}
      />
    );
  }

  // Map opened from within an active emergency
  if (page === 'emergency-map') {
    return (
      <AEDMap
        onNavigate={setPage}
        onStartEmergency={handleStartEmergency}
        emergencyElapsed={elapsed}
        onReturnToEmergency={() => setPage('emergency')}
      />
    );
  }

  if (page === 'summary' && rescueSession) {
    return (
      <RescueSummary
        session={rescueSession}
        onNavigate={setPage}
        onReset={handleReset}
      />
    );
  }

  return <Home onNavigate={setPage} />;
}
