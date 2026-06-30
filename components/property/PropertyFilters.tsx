'use client';

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { IPropertyFilter } from '@/types/property';
import { usePropertyStore } from '@/store/propertyStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search, MapPin, SlidersHorizontal, X, ChevronDown, Map,
  Bed, Bath, DollarSign, Home, CheckCircle2, Maximize
} from 'lucide-react';
import { SelectedLocation } from './MapLocationSearch';

// Dynamic import: Leaflet must not run on the server
const MapLocationSearch = dynamic(() => import('./MapLocationSearch'), {
  ssr: false,
  loading: () => (
    <div className="h-[320px] bg-gray-50 rounded-[16px] flex items-center justify-center border border-gray-200/80">
      <div className="flex flex-col items-center gap-2 text-gray-400">
        <Map className="w-6 h-6 animate-pulse" />
        <span className="text-sm">Loading map…</span>
      </div>
    </div>
  ),
});

interface PropertyFiltersProps {
  onFilterChange: (filters: IPropertyFilter) => void;
  initialFilters?: IPropertyFilter;
}

const PROPERTY_TYPES = ['All Types', 'Villa', 'Apartment', 'Penthouse', 'Commercial', 'Townhouse', 'Land'];
const PRICE_RANGES = [
  { label: 'Any Price', min: undefined, max: undefined },
  { label: 'Under $200k', min: undefined, max: 200000 },
  { label: '$200k – $500k', min: 200000, max: 500000 },
  { label: '$500k – $1M', min: 500000, max: 1000000 },
  { label: '$1M – $5M', min: 1000000, max: 5000000 },
  { label: '$5M+', min: 5000000, max: undefined },
];
const STATUS_OPTIONS = ['All', 'Available', 'Rented', 'Sold'];
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price (Low to High)', value: 'price_asc' },
  { label: 'Price (High to Low)', value: 'price_desc' },
  { label: 'Nearest', value: 'nearest' },
  { label: 'Popular', value: 'popular' },
];
const AMENITIES = ['Pool', 'Gym', 'Parking', 'Balcony', 'Garden', 'Security', 'Elevator', 'Air Conditioning'];

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({ onFilterChange, initialFilters }) => {
  const { totalCount } = usePropertyStore();
  const [city, setCity] = useState(initialFilters?.city || '');
  const [propertyType, setPropertyType] = useState(initialFilters?.propertyType || 'All Types');
  
  const initialPriceRange = PRICE_RANGES.find(r => r.min === initialFilters?.minPrice && r.max === initialFilters?.maxPrice) || PRICE_RANGES[0];
  const [priceRange, setPriceRange] = useState(initialPriceRange);
  
  const [bedrooms, setBedrooms] = useState<number | undefined>(initialFilters?.bedrooms);
  const [bathrooms, setBathrooms] = useState<number | undefined>(initialFilters?.bathrooms);
  const [minArea, setMinArea] = useState<string>(initialFilters?.minArea?.toString() || '');
  const [maxArea, setMaxArea] = useState<string>(initialFilters?.maxArea?.toString() || '');
  const [status, setStatus] = useState<string>(initialFilters?.status || 'All');
  const [furnished, setFurnished] = useState<boolean>(initialFilters?.furnished || false);
  const [amenities, setAmenities] = useState<string[]>(initialFilters?.amenities || []);
  const [sortBy, setSortBy] = useState<string>(initialFilters?.sortBy || 'newest');
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(
    initialFilters?.lat && initialFilters?.lng ? {
      lat: initialFilters.lat,
      lng: initialFilters.lng,
      radius: initialFilters.radius || 10,
      address: initialFilters.address || 'Selected Location'
    } : null
  );

  const buildFilters = useCallback(
    (overrides: Partial<IPropertyFilter> = {}): IPropertyFilter => {
      const base: IPropertyFilter = {
        city: selectedLocation ? undefined : city || undefined,
        propertyType: propertyType !== 'All Types' ? propertyType : undefined,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        minArea: minArea ? parseInt(minArea) : undefined,
        maxArea: maxArea ? parseInt(maxArea) : undefined,
        status: status !== 'All' ? status : undefined,
        furnished: furnished ? true : undefined,
        amenities: amenities.length > 0 ? amenities : undefined,
        sortBy: sortBy as any,
        lat: selectedLocation?.lat,
        lng: selectedLocation?.lng,
        radius: selectedLocation?.radius,
      };
      return { ...base, ...overrides };
    },
    [city, propertyType, priceRange, bedrooms, bathrooms, minArea, maxArea, status, furnished, amenities, sortBy, selectedLocation]
  );

  // Trigger search when sort by changes
  useEffect(() => {
    onFilterChange(buildFilters());
  }, [sortBy]);

  const handleSearch = () => {
    onFilterChange(buildFilters());
    setShowAdvanced(false);
  };

  const handleLocationSelect = useCallback(
    (loc: SelectedLocation) => {
      setSelectedLocation(loc);
      setCity(''); 
      const filters = buildFilters({ lat: loc.lat, lng: loc.lng, radius: loc.radius, city: undefined });
      onFilterChange(filters);
    },
    [buildFilters, onFilterChange]
  );

  const handleClearLocation = useCallback(() => {
    setSelectedLocation(null);
    onFilterChange(buildFilters({ lat: undefined, lng: undefined, radius: undefined }));
  }, [buildFilters, onFilterChange]);

  const handleReset = () => {
    setCity('');
    setPropertyType('All Types');
    setPriceRange(PRICE_RANGES[0]);
    setBedrooms(undefined);
    setBathrooms(undefined);
    setMinArea('');
    setMaxArea('');
    setStatus('All');
    setFurnished(false);
    setAmenities([]);
    setSortBy('newest');
    setSelectedLocation(null);
    onFilterChange({});
    setShowAdvanced(false);
  };

  const toggleAmenity = (am: string) => {
    setAmenities(prev => prev.includes(am) ? prev.filter(a => a !== am) : [...prev, am]);
  };

  const hasActiveFilters =
    !!city || propertyType !== 'All Types' || priceRange !== PRICE_RANGES[0] || 
    bedrooms !== undefined || bathrooms !== undefined || minArea || maxArea || 
    status !== 'All' || furnished || amenities.length > 0 || !!selectedLocation || sortBy !== 'newest';

  return (
    <div className="mb-8 space-y-4">
      {/* Main Filter Bar */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100/80 overflow-hidden relative z-10">
        {/* Top Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          
          {/* Location Input + Map Button */}
          <div className="flex items-center gap-2 px-4 py-3 flex-1 min-w-0">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
            {selectedLocation ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-medium text-gray-800 truncate block">{selectedLocation.address.split(',')[0]}</span>
                  <span className="text-[11px] text-primary font-semibold">{selectedLocation.radius} km radius</span>
                </div>
                <button suppressHydrationWarning onClick={handleClearLocation} className="text-gray-400 hover:text-gray-700 shrink-0 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <input
                suppressHydrationWarning
                type="text"
                placeholder="Search by city…"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 bg-transparent text-[14px] font-medium text-gray-900 outline-none placeholder:text-gray-400 placeholder:font-normal"
              />
            )}
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => setShowMapModal(!showMapModal)}
              title="Search by map"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all shrink-0 ${
                showMapModal || selectedLocation
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>

          {/* Property Type */}
          <div className="relative flex items-center px-4 py-3 min-w-[150px]">
            <Home className="w-4 h-4 text-gray-400 shrink-0 mr-2" />
            <select
              suppressHydrationWarning
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="flex-1 bg-transparent text-[14px] font-medium text-gray-900 outline-none appearance-none cursor-pointer"
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1" />
          </div>

          {/* Price Range */}
          <div className="relative flex items-center px-4 py-3 min-w-[150px]">
            <DollarSign className="w-4 h-4 text-gray-400 shrink-0 mr-1" />
            <select
              suppressHydrationWarning
              value={priceRange.label}
              onChange={(e) => {
                const found = PRICE_RANGES.find((r) => r.label === e.target.value);
                if (found) setPriceRange(found);
              }}
              className="flex-1 bg-transparent text-[14px] font-medium text-gray-900 outline-none appearance-none cursor-pointer"
            >
              {PRICE_RANGES.map((r) => (
                <option key={r.label} value={r.label}>{r.label}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1" />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50/50 sm:bg-transparent">
            <Button
              onClick={handleSearch}
              className="h-9 px-5 bg-[#B8E66B] hover:bg-[#a5d15c] text-black font-semibold rounded-full shadow-sm text-[13px] flex-1 sm:flex-none"
            >
              <Search className="w-3.5 h-3.5 mr-1.5" />
              Search
            </Button>
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`h-9 px-4 rounded-full text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all flex-1 sm:flex-none ${
                showAdvanced ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {hasActiveFilters && !showAdvanced && <span className="w-2 h-2 rounded-full bg-primary absolute top-1 right-1" />}
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvanced && (
          <div className="border-t border-gray-100 px-5 py-6 bg-gray-50/80">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              
              {/* Column 1: Specs */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Bed className="w-3.5 h-3.5" /> Bedrooms
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[undefined, 1, 2, 3, 4, 5].map((n) => (
                      <button
                        suppressHydrationWarning
                        key={n ?? 'any'}
                        type="button"
                        onClick={() => setBedrooms(n)}
                        className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                          bedrooms === n
                            ? 'bg-gray-900 text-white shadow-sm'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {n === undefined ? 'Any' : n === 5 ? '5+' : n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Bath className="w-3.5 h-3.5" /> Bathrooms
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[undefined, 1, 2, 3, 4].map((n) => (
                      <button
                        suppressHydrationWarning
                        key={n ?? 'any'}
                        type="button"
                        onClick={() => setBathrooms(n)}
                        className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                          bathrooms === n
                            ? 'bg-gray-900 text-white shadow-sm'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {n === undefined ? 'Any' : n === 4 ? '4+' : n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Column 2: Area & Status */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Maximize className="w-3.5 h-3.5" /> Property Size (sqft)
                  </label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      placeholder="Min" 
                      value={minArea} 
                      onChange={e => setMinArea(e.target.value)}
                      className="bg-white border-gray-200 h-9"
                    />
                    <span className="text-gray-400">-</span>
                    <Input 
                      type="number" 
                      placeholder="Max" 
                      value={maxArea} 
                      onChange={e => setMaxArea(e.target.value)}
                      className="bg-white border-gray-200 h-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Status & Furnishing</label>
                  <div className="flex items-center gap-3">
                    <select
                      suppressHydrationWarning
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                      className="h-9 px-3 rounded-md border border-gray-200 bg-white text-[13px] font-medium flex-1 outline-none focus:border-gray-400"
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <label className="flex items-center gap-2 cursor-pointer text-[13px] font-medium text-gray-700">
                      <input 
                        type="checkbox" 
                        checked={furnished} 
                        onChange={e => setFurnished(e.target.checked)}
                        className="rounded text-primary focus:ring-primary w-4 h-4"
                      />
                      Furnished
                    </label>
                  </div>
                </div>
              </div>

              {/* Column 3: Amenities */}
              <div className="space-y-2 lg:col-span-2">
                <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map(am => (
                    <button
                      suppressHydrationWarning
                      key={am}
                      type="button"
                      onClick={() => toggleAmenity(am)}
                      className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                        amenities.includes(am)
                          ? 'bg-primary/10 text-primary border border-primary/30'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {am}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Advanced Filters Footer */}
            <div className="mt-8 pt-5 border-t border-gray-200/60 flex items-center justify-between">
              <button
                suppressHydrationWarning
                type="button"
                onClick={handleReset}
                className="text-[13px] font-semibold text-destructive hover:underline"
              >
                Clear all filters
              </button>
              <Button
                onClick={handleSearch}
                className="h-10 px-6 bg-gray-900 hover:bg-black text-white font-semibold rounded-full shadow-md text-[14px]"
              >
                Show {totalCount > 0 ? `${totalCount} Properties` : 'Results'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Map Search Panel */}
      {showMapModal && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100/80 p-4 sm:p-5 relative z-20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[15px] font-bold text-gray-900">Search by Location</h3>
              <p className="text-[12px] text-gray-400 mt-0.5">
                Pin a location on the map to find nearby properties.
              </p>
            </div>
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => setShowMapModal(false)}
              className="text-gray-400 hover:text-gray-700 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <MapLocationSearch
            onLocationSelect={handleLocationSelect}
            onClear={handleClearLocation}
            initialLocation={selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng, radius: selectedLocation.radius } : undefined}
          />
          {selectedLocation && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-[12px] text-gray-500">
                Results update automatically when you pin.
              </p>
              <Button
                onClick={() => setShowMapModal(false)}
                size="sm"
                className="bg-[#B8E66B] hover:bg-[#a5d15c] text-black font-semibold rounded-full px-5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Done
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Bottom Bar: Badges & Sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 px-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* Active Geo Filter Badge */}
          {selectedLocation && !showMapModal && (
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5">
              <Map className="w-3.5 h-3.5 text-primary shrink-0" />
              <p className="text-[12px] font-medium text-gray-800">
                Within <span className="font-bold text-primary">{selectedLocation.radius} km</span> of pinned location
              </p>
              <button suppressHydrationWarning onClick={handleClearLocation} className="text-gray-500 hover:text-gray-900 ml-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          
          {totalCount > 0 && (
             <p className="text-[13px] font-medium text-gray-500">
               Showing <span className="text-gray-900 font-bold">{totalCount}</span> properties
             </p>
          )}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Sort By</label>
          <div className="relative">
            <select
              suppressHydrationWarning
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-gray-900 outline-none appearance-none cursor-pointer focus:border-gray-400 shadow-sm"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
