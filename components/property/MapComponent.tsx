'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Loader2, Locate, CheckCircle2, X } from 'lucide-react';

// Fix Leaflet's default icon issue with bundlers
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

export interface LocationData {
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface MapComponentProps {
  locationData: LocationData;
  onChange: (data: LocationData) => void;
  readOnly?: boolean;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: any;
}

// Component to handle map center updates when props change
const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, { animate: true, duration: 1.5 });
  }, [center, map]);
  return null;
};

// Component to handle clicks on the map
const MapClickHandler = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export default function MapComponent({ locationData, onChange, readOnly = false }: MapComponentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasLocation = locationData.coordinates.lat !== 0 || locationData.coordinates.lng !== 0;
  const center: [number, number] = hasLocation 
    ? [locationData.coordinates.lat, locationData.coordinates.lng] 
    : [25.2048, 55.2708]; // Default Dubai

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=en`, {
        headers: { 'Accept-Language': 'en' }
      });
      const data = await response.json();
      
      if (data && data.address) {
        const addr = data.address;
        const newLocation: LocationData = {
          address: addr.road || addr.suburb || addr.neighbourhood || data.name || '',
          city: addr.city || addr.town || addr.village || addr.county || addr.state_district || '',
          state: addr.state || '',
          country: addr.country || '',
          zipCode: addr.postcode || '',
          coordinates: { lat, lng }
        };
        
        // If address is totally empty but we have a display name, fallback to display name split
        if (!newLocation.address && data.display_name) {
          newLocation.address = data.display_name.split(',')[0];
        }

        onChange(newLocation);
        setSearchQuery(data.display_name);
      } else {
        // Fallback if no address details
        onChange({
          ...locationData,
          address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          coordinates: { lat, lng }
        });
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      onChange({
        ...locationData,
        coordinates: { lat, lng }
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5&addressdetails=1&accept-language=en`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data: NominatimResult[] = await res.json();
        setSearchResults(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Geocoding error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  const handleSelectResult = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const addr = result.address;
    
    onChange({
      address: addr.road || addr.suburb || addr.neighbourhood || result.name || result.display_name.split(',')[0] || '',
      city: addr.city || addr.town || addr.village || addr.county || addr.state_district || '',
      state: addr.state || '',
      country: addr.country || '',
      zipCode: addr.postcode || '',
      coordinates: { lat, lng }
    });
    
    setSearchResults([]);
    setShowSuggestions(false);
    setSearchQuery(result.display_name);
  };

  const handleDetectLocation = () => {
    setLocationError(null);
    if (navigator.geolocation) {
      setIsGeolocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          reverseGeocode(position.coords.latitude, position.coords.longitude);
          setIsGeolocating(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsGeolocating(false);
          setLocationError("Could not detect location. Please ensure location permissions are enabled.");
        },
        { timeout: 10000 }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    onChange({
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      coordinates: { lat: 0, lng: 0 }
    });
  };

  // If in readOnly mode (e.g. viewing property details), display a simpler beautiful map
  if (readOnly) {
    return (
      <div className="border rounded-[16px] overflow-hidden relative z-0 h-[300px] shadow-sm">
        <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {hasLocation && <Marker position={center} icon={selectedIcon} />}
        </MapContainer>
        <div className="absolute bottom-4 right-4 z-[400] bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-gray-100/50 flex items-center gap-2">
           <MapPin className="w-4 h-4 text-primary" />
           <span className="text-[13px] font-semibold text-gray-800">{locationData.address || locationData.city}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {locationError && (
        <div className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-xl border border-destructive/20 flex items-center gap-2">
          <X className="w-4 h-4 shrink-0" />
          <p>{locationError}</p>
        </div>
      )}
      
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-3 relative" ref={searchRef}>
        <div className="relative flex-1">
          <div className="flex items-center gap-2 bg-[#f9f9f9] rounded-xl px-4 py-3 border border-gray-200/80 focus-within:border-gray-400 focus-within:bg-white transition-all shadow-sm">
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-gray-400 shrink-0 animate-spin" />
            ) : (
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
            )}
            <input 
              suppressHydrationWarning
              type="text"
              placeholder="Search for an address, city, or landmark..." 
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchResults.length > 0 && setShowSuggestions(true)}
              className="flex-1 bg-transparent text-[14px] font-medium text-gray-900 outline-none placeholder:text-gray-400 placeholder:font-normal"
            />
            {searchQuery && (
              <button type="button" onClick={handleClear} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Autocomplete Dropdown */}
          {showSuggestions && searchResults.length > 0 && (
            <div className="absolute z-[1000] top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-100 max-h-64 overflow-y-auto">
              {searchResults.map((result, i) => (
                <div 
                  key={result.place_id} 
                  className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                  onClick={() => handleSelectResult(result)}
                >
                  <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[13px] font-medium text-gray-900 line-clamp-1">{result.display_name.split(',')[0]}</p>
                    <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{result.display_name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleDetectLocation} 
          disabled={isGeolocating}
          className="gap-2 shrink-0 h-auto py-3 px-5 rounded-xl border-gray-200/80 bg-white hover:bg-gray-50 shadow-sm"
        >
          {isGeolocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Locate className="w-4 h-4 text-primary" />}
          <span className="font-semibold text-[13px]">Use My Location</span>
        </Button>
      </div>

      {/* Selected Location Summary */}
      {hasLocation && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-green-700 uppercase tracking-wider mb-1">Selected Location Details</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[13px] text-green-900">
                <p><span className="font-semibold opacity-70">Address:</span> {locationData.address || 'N/A'}</p>
                <p><span className="font-semibold opacity-70">City:</span> {locationData.city || 'N/A'}</p>
                <p><span className="font-semibold opacity-70">State:</span> {locationData.state || 'N/A'}</p>
                <p><span className="font-semibold opacity-70">Country:</span> {locationData.country || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Map */}
      <div className="border border-gray-200/80 rounded-[16px] overflow-hidden relative z-0 h-[380px] shadow-sm">
        {!hasLocation && (
          <div className="absolute inset-0 flex items-center justify-center z-[400] pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl px-6 py-4 shadow-xl border border-gray-100 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <p className="text-[14px] font-bold text-gray-900">Select Property Location</p>
              <p className="text-[12px] text-gray-500 mt-1">Search, use your location, or click anywhere on the map.</p>
            </div>
          </div>
        )}
        <MapContainer 
          center={center} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={center} />
          <MapClickHandler onLocationSelect={reverseGeocode} />
          
          {hasLocation && (
            <Marker 
              position={center} 
              icon={selectedIcon}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  reverseGeocode(position.lat, position.lng);
                }
              }}
            />
          )}
        </MapContainer>
        
        {/* Helper overlay text */}
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl text-[12px] font-semibold shadow-lg border border-gray-100 pointer-events-none flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          Click map or drag marker to adjust
        </div>
      </div>
    </div>
  );
}
