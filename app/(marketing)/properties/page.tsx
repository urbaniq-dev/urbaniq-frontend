<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { usePropertyStore } from '@/store/propertyStore';
import { PropertyCard } from '@/components/property/PropertyCard';
import { PropertyFilters } from '@/components/property/PropertyFilters';
import { Loader2, SearchX } from 'lucide-react';
import { IPropertyFilter } from '@/types/property';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

function PublicPropertiesContent() {
  const searchParams = useSearchParams();
  const { properties, isLoading, error, fetchProperties } = usePropertyStore();
  
  const [filters, setFilters] = useState<IPropertyFilter>(() => {
    const initial: IPropertyFilter = {};
    if (searchParams.get('city')) initial.city = searchParams.get('city') as string;
    if (searchParams.get('propertyType')) initial.propertyType = searchParams.get('propertyType') as string;
    if (searchParams.get('minPrice')) initial.minPrice = parseInt(searchParams.get('minPrice') as string, 10);
    if (searchParams.get('maxPrice')) initial.maxPrice = parseInt(searchParams.get('maxPrice') as string, 10);
    if (searchParams.get('lat')) initial.lat = parseFloat(searchParams.get('lat') as string);
    if (searchParams.get('lng')) initial.lng = parseFloat(searchParams.get('lng') as string);
    if (searchParams.get('radius')) initial.radius = parseInt(searchParams.get('radius') as string, 10);
    if (searchParams.get('address')) initial.address = searchParams.get('address') as string;
    return initial;
  });

  useEffect(() => {
    fetchProperties(filters);
  }, [fetchProperties, filters]);

  const handleFilterChange = (newFilters: IPropertyFilter) => {
    setFilters(newFilters);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl -mt-8 relative z-20">
      {/* Filters */}
      <PropertyFilters 
        onFilterChange={handleFilterChange} 
        initialFilters={filters}
      />

      {/* Content */}
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-center mb-8">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-card border rounded-2xl p-16 text-center shadow-sm max-w-2xl mx-auto my-12">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <SearchX className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold mb-3">No properties found</h3>
          <p className="text-muted-foreground mb-8">
            We couldn't find any properties matching your current search criteria. Please try adjusting your filters or check back later.
          </p>
          <button 
            suppressHydrationWarning
            onClick={() => handleFilterChange({})}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property, index) => (
            <motion.div
              key={property._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <PropertyCard 
                property={property} 
                href={`/properties/${property._id}`}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PublicPropertiesPage() {
  return (
    <div className="min-h-screen bg-muted/10 pb-20">
      {/* Hero Section */}
      <section className="bg-black text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80" 
            alt="Luxury modern home" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Discover Premium Properties
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Explore our curated selection of exclusive real estate listings, tailored for discerning buyers.
          </p>
        </div>
      </section>

      <Suspense fallback={<div className="flex justify-center py-32"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>}>
        <PublicPropertiesContent />
      </Suspense>
    </div>
  );
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
}
