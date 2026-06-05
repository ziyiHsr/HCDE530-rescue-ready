import { AEDLocation, UserLocation } from './types';

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dphi = ((lat2 - lat1) * Math.PI) / 180;
  const dlambda = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dphi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export async function fetchAEDs(
  location: UserLocation,
  radiusMeters = 3000
): Promise<AEDLocation[]> {
  // For UW coords, always use the stable mock dataset — Overpass results there are unreliable.
  if (isUWLocation(location)) {
    return getMockAEDs(location);
  }

  const query = `
    [out:json][timeout:15];
    node["emergency"="defibrillator"](around:${radiusMeters},${location.lat},${location.lng});
    out body;
  `;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Overpass API error');

  const data = await response.json();

  return (data.elements as any[]).map((el) => ({
    id: String(el.id),
    lat: el.lat,
    lng: el.lon,
    name: el.tags?.name,
    address:
      el.tags?.['addr:street'] && el.tags?.['addr:housenumber']
        ? `${el.tags['addr:housenumber']} ${el.tags['addr:street']}`
        : el.tags?.['addr:full'] ?? undefined,
    operator: el.tags?.operator,
    access: el.tags?.access,
    note: el.tags?.note ?? el.tags?.description,
    distance: calculateDistance(location.lat, location.lng, el.lat, el.lon),
  }));
}

// Fixed AED locations near University of Washington (47.6553, -122.3035)
// Used whenever the UW preset is selected to guarantee stable demo results.
const UW_MOCK_AEDS: Omit<AEDLocation, 'distance'>[] = [
  { id: 'uw-1', lat: 47.6497, lng: -122.3080, name: 'UW Medical Center AED', address: '1959 NE Pacific St' },
  { id: 'uw-2', lat: 47.6567, lng: -122.3051, name: 'Husky Union Building AED', address: '4001 E Stevens Way NE' },
  { id: 'uw-3', lat: 47.6561, lng: -122.3128, name: 'Odegaard Library AED', address: '4060 George Washington Ln NE' },
  { id: 'uw-4', lat: 47.6527, lng: -122.3007, name: 'IMA Sports Center AED', address: '3924 Brooklyn Ave NE' },
  { id: 'uw-5', lat: 47.6609, lng: -122.3144, name: 'University District AED', address: '4300 University Way NE' },
  { id: 'uw-6', lat: 47.6541, lng: -122.2980, name: 'Husky Stadium AED', address: '3800 Montlake Blvd NE' },
];

const UW_CENTER = { lat: 47.6553, lng: -122.3035 };
const UW_THRESHOLD = 0.002; // ~200m tolerance to identify UW coords

function isUWLocation(loc: UserLocation): boolean {
  return (
    Math.abs(loc.lat - UW_CENTER.lat) < UW_THRESHOLD &&
    Math.abs(loc.lng - UW_CENTER.lng) < UW_THRESHOLD
  );
}

export function getMockAEDs(location: UserLocation): AEDLocation[] {
  if (isUWLocation(location)) {
    return UW_MOCK_AEDS.map((aed) => ({
      ...aed,
      distance: calculateDistance(location.lat, location.lng, aed.lat, aed.lng),
    })).sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  }

  const offsets = [
    { dlat: 0.004, dlng: 0.003, name: 'City Hall Lobby', address: '1 Main Street' },
    { dlat: -0.005, dlng: 0.007, name: 'Central Library', address: '200 Park Ave' },
    { dlat: 0.009, dlng: -0.002, name: 'Community Center', address: '55 Oak Blvd' },
    { dlat: -0.002, dlng: -0.006, name: 'Fire Station 7', address: '300 Elm Street' },
    { dlat: 0.012, dlng: 0.009, name: 'Metro Station Entrance', address: 'Platform Level' },
    { dlat: -0.008, dlng: -0.011, name: 'Sports Complex', address: '88 Stadium Drive' },
  ];

  return offsets.map((o, i) => {
    const lat = location.lat + o.dlat;
    const lng = location.lng + o.dlng;
    return {
      id: `mock-${i}`,
      lat,
      lng,
      name: o.name,
      address: o.address,
      distance: calculateDistance(location.lat, location.lng, lat, lng),
    };
  });
}
