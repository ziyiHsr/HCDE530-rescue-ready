import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { AEDLocation, UserLocation } from '../types';

interface MapViewProps {
  userLocation: UserLocation;
  aeds: AEDLocation[];
  onAEDSelect: (aed: AEDLocation) => void;
  selectedAED: AEDLocation | null;
  locationLabel?: string;
}

// Fix Leaflet default marker icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

let styleInjected = false;
function injectStyles() {
  if (styleInjected) return;
  styleInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes aed-pulse {
      0%   { transform: scale(1);   opacity: 0.7; }
      50%  { transform: scale(1.6); opacity: 0; }
      100% { transform: scale(1);   opacity: 0; }
    }
    @keyframes loc-ping {
      0%   { transform: scale(1);   opacity: 0.6; }
      70%  { transform: scale(2.2); opacity: 0; }
      100% { transform: scale(1);   opacity: 0; }
    }
    .aed-marker-wrap {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .aed-pulse-ring {
      position: absolute;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.45);
      animation: aed-pulse 1.8s ease-out infinite;
    }
    .aed-pulse-ring-delay { animation-delay: 0.9s; }
    .aed-marker-body {
      position: relative;
      z-index: 2;
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
      border: 3px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 0 3px rgba(239,68,68,0.4), 0 4px 20px rgba(0,0,0,0.5);
      font-weight: 900;
      color: white;
      font-size: 22px;
      font-family: sans-serif;
      line-height: 1;
    }
    .aed-marker-body.selected {
      background: linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%);
      border-color: #fde68a;
      box-shadow: 0 0 0 4px rgba(220,38,38,0.6), 0 6px 24px rgba(0,0,0,0.6);
      width: 54px;
      height: 54px;
      font-size: 26px;
    }
    .aed-marker-body.nearest {
      border-color: #34d399;
      box-shadow: 0 0 0 3px rgba(52,211,153,0.5), 0 4px 20px rgba(0,0,0,0.5);
    }
    /* Location pin */
    .loc-pin-wrap {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .loc-ping-ring {
      position: absolute;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: rgba(59,130,246,0.5);
      animation: loc-ping 2s ease-out infinite;
    }
    .loc-pin-body {
      position: relative;
      z-index: 2;
      width: 22px;
      height: 22px;
      background: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.35), 0 3px 12px rgba(0,0,0,0.5);
    }
  `;
  document.head.appendChild(style);
}

function makeAedIcon(selected: boolean, nearest: boolean) {
  injectStyles();
  const size = selected ? 60 : 52;
  const bodyClass = `aed-marker-body${selected ? ' selected' : ''}${nearest && !selected ? ' nearest' : ''}`;
  return L.divIcon({
    className: '',
    html: `<div class="aed-marker-wrap" style="width:${size}px;height:${size}px">
      <div class="aed-pulse-ring"></div>
      <div class="aed-pulse-ring aed-pulse-ring-delay"></div>
      <div class="${bodyClass}">+</div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

const locationPinIcon = () => {
  injectStyles();
  return L.divIcon({
    className: '',
    html: `<div class="loc-pin-wrap" style="width:30px;height:30px">
      <div class="loc-ping-ring"></div>
      <div class="loc-pin-body"></div>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -18],
  });
};

export default function MapView({
  userLocation,
  aeds,
  onAEDSelect,
  selectedAED,
  locationLabel,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const locationMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const nearestLabelRef = useRef<L.Marker | null>(null);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    injectStyles();

    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([userLocation.lat, userLocation.lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  // Update location marker + radius circle + re-center when userLocation changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old location marker
    if (locationMarkerRef.current) {
      locationMarkerRef.current.remove();
      locationMarkerRef.current = null;
    }

    map.setView([userLocation.lat, userLocation.lng], 14, { animate: true });

    const tooltip = locationLabel ?? 'Viewing here';
    locationMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
      icon: locationPinIcon(),
      zIndexOffset: 1000,
    })
      .addTo(map)
      .bindTooltip(tooltip, { permanent: true, direction: 'top', offset: [0, -18], className: 'loc-tooltip' });
  }, [userLocation.lat, userLocation.lng, locationLabel]);

  // Update AED markers when list changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentIds = new Set(aeds.map((a) => a.id));
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    aeds.forEach((aed, idx) => {
      if (!markersRef.current.has(aed.id)) {
        const marker = L.marker([aed.lat, aed.lng], {
          icon: makeAedIcon(false, idx === 0),
          zIndexOffset: 500,
        })
          .addTo(map)
          .on('click', () => onAEDSelect(aed));
        markersRef.current.set(aed.id, marker);
      }
    });
  }, [aeds]);

  // Draw route from userLocation to nearest AED
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old route + label
    if (routeLineRef.current) { routeLineRef.current.remove(); routeLineRef.current = null; }
    if (nearestLabelRef.current) { nearestLabelRef.current.remove(); nearestLabelRef.current = null; }

    const nearest = aeds[0];
    if (!nearest) return;

    // Dashed line from location to nearest AED
    routeLineRef.current = L.polyline(
      [[userLocation.lat, userLocation.lng], [nearest.lat, nearest.lng]],
      { color: '#34d399', weight: 3, dashArray: '8 6', opacity: 0.85 }
    ).addTo(map);

    // Midpoint label showing distance
    const midLat = (userLocation.lat + nearest.lat) / 2;
    const midLng = (userLocation.lng + nearest.lng) / 2;
    const distM = nearest.distance ?? 0;
    const distText = distM < 1000 ? `${Math.round(distM)} m` : `${(distM / 1000).toFixed(1)} km`;

    nearestLabelRef.current = L.marker([midLat, midLng], {
      icon: L.divIcon({
        className: '',
        html: `<div style="background:rgba(15,23,42,0.85);color:#34d399;font-size:11px;font-weight:700;font-family:sans-serif;padding:3px 8px;border-radius:20px;border:1px solid rgba(52,211,153,0.4);white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.4)">${distText} to nearest</div>`,
        iconAnchor: [40, 10],
      }),
      interactive: false,
      zIndexOffset: 800,
    }).addTo(map);
  }, [aeds, userLocation.lat, userLocation.lng]);

  // Update selected marker icons
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const idx = aeds.findIndex((a) => a.id === id);
      marker.setIcon(makeAedIcon(selectedAED?.id === id, idx === 0));
    });

    if (selectedAED && mapRef.current) {
      mapRef.current.panTo([selectedAED.lat, selectedAED.lng], { animate: true });
    }
  }, [selectedAED, aeds]);

  return <div ref={containerRef} className="w-full h-full" />;
}
