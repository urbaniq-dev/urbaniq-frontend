'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin, Navigation, Search, X, Locate, ChevronDown,
  Loader2, CheckCircle2,
} from 'lucide-react';

// Fix Leaflet marker icons in webpack/Next.js builds
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom pin icon
const selectedIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export interface SelectedLocation {
  lat: number;
  lng: number;
  address: string;
  radius: number;
}

interface MapLocationSearchProps {
  onLocationSelect: (location: SelectedLocation) => void;
  onClear: () => void;
  initialLocation?: { lat: number; lng: number };
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
}

const RADIUS_OPTIONS = [
  { label: '1 km', value: 1 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: '50 km', value: 50 },
];

// Re-center map component (called when coordinates change externally)
function MapFlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 13, { animate: true, duration: 1 });
  }, [lat, lng, map]);
  return null;
}

// Map click handler
function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapLocationSearch({
  onLocationSelect,
  onClear,
  initialLocation,
}: MapLocationSearchProps) {
  const DEFAULT_CENTER: [number, number] = initialLocation
    ? [initialLocation.lat, initialLocation.lng]
    : [25.2048, 55.2708]; // Dubai default

  const [markerPos, setMarkerPos] = useState<[number, number] | null>(
    initialLocation ? [initialLocation.lat, initialLocation.lng] : null
  );
  const [address, setAddress] = useState('');
  const [radius, setRadius] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close suggestion dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=en`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  }, []);

  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      setMarkerPos([lat, lng]);
      const addr = await reverseGeocode(lat, lng);
      setAddress(addr);
      setSearchQuery(addr);
      onLocationSelect({ lat, lng, address: addr, radius });
    },
    [reverseGeocode, onLocationSelect, radius]
  );

  const handleSuggestionSelect = useCallback(
    async (item: NominatimResult) => {
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lon);
      const addr = item.display_name;
      setMarkerPos([lat, lng]);
      setAddress(addr);
      setSearchQuery(addr);
      setSuggestions([]);
      setShowSuggestions(false);
      setFlyTarget({ lat, lng });
      onLocationSelect({ lat, lng, address: addr, radius });
    },
    [onLocationSelect, radius]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=6&addressdetails=1&accept-language=en`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data: NominatimResult[] = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const addr = await reverseGeocode(lat, lng);
        setMarkerPos([lat, lng]);
        setAddress(addr);
        setSearchQuery(addr);
        setFlyTarget({ lat, lng });
        onLocationSelect({ lat, lng, address: addr, radius });
        setIsGeolocating(false);
      },
      () => setIsGeolocating(false),
      { timeout: 8000 }
    );
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    if (markerPos) {
      onLocationSelect({
        lat: markerPos[0],
        lng: markerPos[1],
        address,
        radius: newRadius,
      });
    }
  };

  const handleClear = () => {
    setMarkerPos(null);
    setAddress('');
    setSearchQuery('');
    setRadius(10);
    setFlyTarget(null);
    setSuggestions([]);
    onClear();
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Search Box */}
      <div ref={searchRef} className="relative">
        <div className="flex items-center gap-2 bg-[#f9f9f9] rounded-[14px] px-4 py-3 border border-gray-200/80 focus-within:border-gray-400 focus-within:bg-white transition-all">
          {isSearching ? (
            <Loader2 className="w-4 h-4 text-gray-400 shrink-0 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
          )}
          <input
            suppressHydrationWarning
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Search city, area, landmark, or address…"
            className="flex-1 bg-transparent text-[14px] font-medium text-gray-900 outline-none placeholder:text-gray-400 placeholder:font-normal"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full mt-1.5 left-0 right-0 bg-white rounded-[14px] shadow-2xl border border-gray-100 z-[9999] overflow-hidden max-h-72 overflow-y-auto">
            {suggestions.map((item) => (
              <button
                key={item.place_id}
                type="button"
                onClick={() => handleSuggestionSelect(item)}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
              >
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[13px] font-medium text-gray-900 line-clamp-1">{item.display_name.split(',')[0]}</p>
                  <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{item.display_name}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Controls Row: Use My Location + Radius */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isGeolocating}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-[12px] font-semibold transition-colors disabled:opacity-60 shrink-0"
        >
          {isGeolocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Locate className="w-3.5 h-3.5" />
          )}
          {isGeolocating ? 'Locating…' : 'Use My Location'}
        </button>

        {/* Radius Selector */}
        <div className="flex items-center gap-1.5 bg-[#f9f9f9] rounded-full px-3 py-1.5 border border-gray-200/80">
          <Navigation className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Radius</span>
          <div className="flex items-center gap-1">
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleRadiusChange(opt.value)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  radius === opt.value
                    ? 'bg-[#B8E66B] text-black shadow-sm'
                    : 'text-gray-500 hover:text-black hover:bg-gray-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Location Badge */}
      {address && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-[12px] px-4 py-2.5">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-green-700 uppercase tracking-wider">Selected Location · {radius} km radius</p>
            <p className="text-[13px] font-medium text-green-900 truncate">{address}</p>
          </div>
          <button type="button" onClick={handleClear} className="text-green-500 hover:text-green-700 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Interactive Map */}
      <div className="relative rounded-[16px] overflow-hidden border border-gray-200/80 shadow-sm" style={{ height: 320 }}>
        {!markerPos && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl px-5 py-3 shadow-lg border border-gray-100 text-center">
              <MapPin className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-[13px] font-semibold text-gray-700">Click anywhere on the map</p>
              <p className="text-[11px] text-gray-400">to set your search location</p>
            </div>
          </div>
        )}
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onClick={handleMapClick} />
          {flyTarget && <MapFlyTo lat={flyTarget.lat} lng={flyTarget.lng} />}
          {markerPos && (
            <Marker position={markerPos} icon={selectedIcon} />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
