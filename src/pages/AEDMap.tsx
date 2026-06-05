import { useEffect, useState, useCallback, useRef } from 'react';
import {
  ArrowLeft, AlertTriangle, MapPin, Navigation, Search,
  Loader2, RefreshCw, X, LocateFixed, Timer, CheckCircle,
} from 'lucide-react';
import { AEDLocation, Page, UserLocation } from '../types';
import { fetchAEDs, formatDistance, formatTime, getMockAEDs } from '../utils';
import MapView from '../components/MapView';

interface AEDMapProps {
  onNavigate: (page: Page) => void;
  onStartEmergency: (userLocation: UserLocation, nearestAED?: AEDLocation) => void;
  /** Set when entered from Emergency Mode — keeps the live timer visible */
  emergencyElapsed?: number;
  onReturnToEmergency?: () => void;
}

type LocationState = 'idle' | 'requesting' | 'granted' | 'denied' | 'manual';

const PRESETS = [
  { label: 'University of Washington', lat: 47.6553, lng: -122.3035 },
  { label: 'Times Square, NYC', lat: 40.758, lng: -73.9855 },
  { label: 'Downtown Seattle', lat: 47.6062, lng: -122.3321 },
];

export default function AEDMap({ onNavigate, onStartEmergency, emergencyElapsed, onReturnToEmergency }: AEDMapProps) {
  const [locationState, setLocationState] = useState<LocationState>('idle');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [aeds, setAEDs] = useState<AEDLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAED, setSelectedAED] = useState<AEDLocation | null>(null);
  const [usedMock, setUsedMock] = useState(false);

  // Search bar
  const [searchInput, setSearchInput] = useState('');
  const [searchError, setSearchError] = useState('');
  const [showPresets, setShowPresets] = useState(false);
  // Committed label shown in the input after selection
  const [committedLabel, setCommittedLabel] = useState<string | null>(null);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isEmergencyActive = emergencyElapsed !== undefined && onReturnToEmergency !== undefined;

  const loadAEDs = useCallback(async (loc: UserLocation) => {
    setLoading(true);
    setUsedMock(false);
    setSelectedAED(null);
    try {
      const results = await fetchAEDs(loc);
      setAEDs(results.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0)));
    } catch {
      const mock = getMockAEDs(loc).sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
      setAEDs(mock);
      setUsedMock(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const applyLocation = useCallback(
    (loc: UserLocation, label: string) => {
      setUserLocation(loc);
      setLocationLabel(label);
      setCommittedLabel(label);
      setSearchInput(label);          // ← keep name visible in the input
      setSearchError('');
      setShowPresets(false);
      setLocationState('manual');
      loadAEDs(loc);
    },
    [loadAEDs]
  );

  const requestGPS = useCallback(() => {
    setLocationState('requesting');
    setCommittedLabel(null);
    setLocationLabel(null);
    setSearchInput('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const label = 'Your current location';
        setUserLocation(loc);
        setLocationLabel(label);
        setCommittedLabel(label);
        setSearchInput(label);
        setLocationState('granted');
        loadAEDs(loc);
      },
      () => setLocationState('denied'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [loadAEDs]);

  useEffect(() => {
    if ('geolocation' in navigator) requestGPS();
    else setLocationState('denied');
  }, []);

  // Close preset dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowPresets(false);
        // If user clicked away without committing, restore committed label
        if (committedLabel !== null) setSearchInput(committedLabel);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [committedLabel]);

  const handleSearch = async () => {
    setSearchError('');
    const q = searchInput.trim();
    if (!q) { setSearchError('Enter a place or address.'); return; }
    // If input matches current committed label exactly, nothing to do
    if (q === committedLabel) { setShowPresets(false); return; }
    setLoading(true);
    setShowPresets(false);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`
      );
      const data = await res.json();
      if (!data.length) {
        setSearchError('Location not found. Try a different address.');
        setLoading(false);
        return;
      }
      const loc: UserLocation = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      const label = data[0].display_name?.split(',').slice(0, 2).join(',').trim() ?? q;
      applyLocation(loc, label);
    } catch {
      setSearchError('Search failed. Try one of the presets below.');
      setLoading(false);
    }
  };

  const handlePreset = (preset: typeof PRESETS[number]) => {
    applyLocation({ lat: preset.lat, lng: preset.lng }, preset.label);
  };

  const showMap = userLocation && locationState !== 'requesting' && locationState !== 'idle';
  const nearestAED = aeds[0] ?? null;

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pb-3 bg-slate-900 border-b border-slate-700 shrink-0" style={{ paddingTop: 'max(0.75rem, calc(var(--sat) + 0.5rem))' }}>
        <button
          onClick={() => onNavigate('home')}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-bold text-lg leading-tight">Nearby AEDs</h2>
          <p className="text-slate-400 text-xs truncate">
            {locationLabel
              ? locationLabel
              : locationState === 'requesting'
              ? 'Requesting location...'
              : locationState === 'denied'
              ? 'Location unavailable'
              : 'Locating...'}
          </p>
        </div>
        {userLocation && (
          <button
            onClick={() => loadAEDs(userLocation)}
            disabled={loading}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-40 shrink-0"
            title="Refresh AEDs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </header>

      {/* Emergency-active banner */}
      {emergencyElapsed !== undefined && onReturnToEmergency && (
        <div className="shrink-0 bg-red-600 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-200 animate-pulse" />
            <span className="text-white font-bold text-sm">Emergency Active</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-red-700/60 px-2.5 py-1 rounded-lg">
              <Timer className="w-3.5 h-3.5 text-red-200" />
              <span className="text-white font-mono font-bold text-sm tabular-nums">
                {formatTime(emergencyElapsed)}
              </span>
            </div>
            <button
              onClick={onReturnToEmergency}
              className="bg-white text-red-600 font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors active:scale-95"
            >
              Return
            </button>
          </div>
        </div>
      )}

      {/* Search bar */}
      <div className="shrink-0 bg-slate-800 border-b border-slate-700 px-3 py-2.5" ref={searchRef}>
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={searchInput}
              onChange={(e) => { setSearchInput(e.target.value); setSearchError(''); }}
              onFocus={() => { setShowPresets(true); inputRef.current?.select(); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
                if (e.key === 'Escape') { setShowPresets(false); if (committedLabel) setSearchInput(committedLabel); }
              }}
              placeholder="Search any location..."
              className="w-full bg-slate-700 text-white placeholder-slate-500 rounded-xl pl-9 pr-8 py-2 text-sm border border-slate-600 focus:border-red-500 focus:outline-none"
            />
            {searchInput && (
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSearchInput('');
                  setCommittedLabel(null);
                  setSearchError('');
                  inputRef.current?.focus();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={handleSearch}
            disabled={loading || !searchInput.trim()}
            className="bg-red-500 hover:bg-red-400 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Go'}
          </button>

          <button
            onClick={requestGPS}
            disabled={locationState === 'requesting'}
            className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl transition-colors disabled:opacity-40 shrink-0"
            title="Use my current location"
          >
            <LocateFixed className="w-4 h-4" />
          </button>
        </div>

        {searchError && <p className="text-red-400 text-xs mt-1.5 px-1">{searchError}</p>}

        {showPresets && (
          <div className="mt-2 bg-slate-700 border border-slate-600 rounded-xl overflow-hidden shadow-xl z-50 relative">
            <p className="px-3 py-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wide border-b border-slate-600">
              Quick locations
            </p>
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onMouseDown={() => handlePreset(preset)}
                className="w-full text-left px-3 py-2.5 text-sm text-white hover:bg-slate-600 flex items-center gap-2 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                {preset.label}
              </button>
            ))}
            {locationState !== 'denied' && (
              <button
                onMouseDown={() => { setShowPresets(false); requestGPS(); }}
                className="w-full text-left px-3 py-2.5 text-sm text-blue-400 hover:bg-slate-600 flex items-center gap-2 transition-colors border-t border-slate-600"
              >
                <LocateFixed className="w-3.5 h-3.5 shrink-0" />
                Use my current location
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mock data banner */}
      {usedMock && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2 shrink-0">
          <p className="text-amber-300 text-xs text-center">
            Showing demo data — live Overpass API unavailable
          </p>
        </div>
      )}

      {/* AED count bar */}
      {showMap && !loading && (
        <div className="shrink-0 border-b border-slate-700 px-4 py-2 flex items-center justify-between bg-slate-900">
          <span className="text-slate-300 text-xs">
            {aeds.length > 0 ? (
              <><span className="text-white font-bold">{aeds.length}</span> AED{aeds.length !== 1 ? 's' : ''} within 3 km</>
            ) : (
              <span className="text-slate-500">No AEDs found in this area</span>
            )}
          </span>
          {nearestAED && (
            <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              Nearest: {formatDistance(nearestAED.distance ?? 0)}
            </span>
          )}
        </div>
      )}

      {/* Requesting GPS */}
      {locationState === 'requesting' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-slate-900">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
            <Navigation className="w-7 h-7 text-blue-400 animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold">Requesting your location...</p>
            <p className="text-slate-400 text-sm mt-1">Allow location access, or search above</p>
          </div>
        </div>
      )}

      {/* Location denied — no location yet */}
      {locationState === 'denied' && !userLocation && (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 bg-slate-900 px-6">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-lg">Location unavailable</p>
            <p className="text-slate-400 text-sm mt-1">Search above or pick a preset to find AEDs.</p>
          </div>
          <div className="w-full max-w-xs space-y-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePreset(preset)}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium py-3 rounded-xl flex items-center gap-2 px-4 transition-colors"
              >
                <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Map + bottom panel */}
      {showMap && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 min-h-0 relative">
            <MapView
              userLocation={userLocation}
              aeds={aeds}
              onAEDSelect={setSelectedAED}
              selectedAED={selectedAED}
              locationLabel={locationLabel ?? undefined}
            />
            {loading && (
              <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center z-30">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-red-400 animate-spin" />
                  <span className="text-white text-sm font-medium">Finding AEDs...</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom panel */}
          <div className="shrink-0 bg-slate-900 border-t border-slate-700 max-h-56 overflow-y-auto footer-safe">
            {!loading && aeds.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 gap-3 px-6 text-center">
                <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-slate-500" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">No AEDs found nearby</p>
                  <p className="text-slate-400 text-xs mt-1">Try searching a different location or use a preset.</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-1">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => handlePreset(preset)}
                      className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <MapPin className="w-3 h-3 text-red-400" />
                      {preset.label.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!loading && aeds.length > 0 && (
              <>
                <div className="px-4 pt-3 pb-2">
                  {isEmergencyActive ? (
                    <button
                      onClick={onReturnToEmergency}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm transition-colors active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      AED Retrieved — Return to Emergency
                    </button>
                  ) : (
                    <button
                      onClick={() => onStartEmergency(userLocation, nearestAED ?? undefined)}
                      className="w-full bg-red-500 hover:bg-red-400 text-white font-bold py-3 rounded-xl text-sm transition-colors active:scale-95"
                    >
                      Start Emergency Mode
                    </button>
                  )}
                </div>
                <ul className="divide-y divide-slate-800">
                  {aeds.map((aed, idx) => (
                    <li key={aed.id}>
                      <button
                        onClick={() => setSelectedAED(aed === selectedAED ? null : aed)}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                          selectedAED?.id === aed.id ? 'bg-red-500/10' : 'hover:bg-slate-800'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${
                          selectedAED?.id === aed.id ? 'bg-red-500 text-white' : 'bg-red-500/20 text-red-400'
                        }`}>+</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-white font-medium text-sm truncate">{aed.name ?? 'AED Location'}</p>
                            {idx === 0 && (
                              <span className="shrink-0 bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                                Nearest
                              </span>
                            )}
                          </div>
                          {aed.address && <p className="text-slate-400 text-xs truncate">{aed.address}</p>}
                        </div>
                        <span className={`text-xs font-semibold shrink-0 ${idx === 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatDistance(aed.distance ?? 0)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
