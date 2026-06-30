<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePropertyStore } from '@/store/propertyStore';
import { Loader2, MapPin, Bed, Bath, Square, ArrowLeft, Building, Mail, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/property/MapComponent'), { ssr: false });

export default function PublicPropertyDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { currentProperty, isLoading, error, fetchPropertyById } = usePropertyStore();

  useEffect(() => {
    if (id) {
      fetchPropertyById(id as string);
    }
  }, [id, fetchPropertyById]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/10">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !currentProperty) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/10 p-4">
        <div className="bg-destructive/10 text-destructive p-6 rounded-xl text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">Property Not Found</h2>
          <p>{error || "This property may have been removed or is no longer available."}</p>
          <Button className="mt-6" onClick={() => router.push('/properties')}>
            Browse Properties
          </Button>
        </div>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
  const mainImage = currentProperty.images && currentProperty.images.length > 0 
    ? (currentProperty.images[0].startsWith('http') ? currentProperty.images[0] : `${baseUrl}${currentProperty.images[0]}`) 
    : null;

  return (
    <div className="min-h-screen bg-muted/10 pb-20">
      {/* Property Header Banner */}
      <div className="w-full h-[50vh] md:h-[60vh] bg-black relative">
        {mainImage ? (
          <img src={mainImage} alt={currentProperty.title} className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary/50 text-muted-foreground">
            No Images Available
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="text-white">
              <Badge className="bg-primary/90 hover:bg-primary text-white mb-4 px-3 py-1 text-sm">
                {currentProperty.status}
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
                {currentProperty.title}
              </h1>
              <div className="flex items-center text-gray-300 text-lg">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                {currentProperty.location?.address}, {currentProperty.location?.city}, {currentProperty.location?.state}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-white min-w-[250px] text-center shadow-2xl">
              <p className="text-sm text-gray-300 uppercase tracking-wider font-semibold mb-1">Asking Price</p>
              <p className="text-4xl font-bold text-white">${currentProperty.price?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl mt-10">
        <Button variant="ghost" className="mb-6 -ml-4 hover:bg-transparent hover:text-primary" onClick={() => router.push('/properties')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Listings
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Overview Section */}
            <div className="bg-card border rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Property Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <Building className="w-6 h-6" />
                  </div>
                  <span className="text-sm text-muted-foreground">Type</span>
                  <span className="font-semibold">{currentProperty.propertyType}</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <Bed className="w-6 h-6" />
                  </div>
                  <span className="text-sm text-muted-foreground">Bedrooms</span>
                  <span className="font-semibold">{currentProperty.features?.bedrooms}</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <Bath className="w-6 h-6" />
                  </div>
                  <span className="text-sm text-muted-foreground">Bathrooms</span>
                  <span className="font-semibold">{currentProperty.features?.bathrooms}</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <Square className="w-6 h-6" />
                  </div>
                  <span className="text-sm text-muted-foreground">Area</span>
                  <span className="font-semibold">{currentProperty.features?.area} sqft</span>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Description</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {currentProperty.description}
                </p>
              </div>
            </div>

            {/* Image Gallery */}
            {currentProperty.images && currentProperty.images.length > 1 && (
              <div className="bg-card border rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-6">Property Gallery</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentProperty.images.slice(1).map((image, index) => {
                    const imgSrc = image.startsWith('http') ? image : `${baseUrl}${image}`;
                    return (
                      <div key={index} className="relative h-[250px] rounded-xl overflow-hidden shadow-sm group">
                        <img 
                          src={imgSrc} 
                          alt={`Property view ${index + 2}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                          onClick={() => window.open(imgSrc, '_blank')}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Amenities Section */}
            <div className="bg-card border rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Premium Amenities</h2>
              {currentProperty.amenities && currentProperty.amenities.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {currentProperty.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <span className="font-medium text-muted-foreground">{amenity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No amenities listed.</p>
              )}
            </div>

            {/* Location Section */}
            <div className="bg-card border rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Location</h2>
              <div className="h-[400px] w-full rounded-xl overflow-hidden border">
                <MapComponent 
                  locationData={{...currentProperty.location, zipCode: currentProperty.location?.zipCode || ''}} 
                  onChange={() => {}} 
                  readOnly={true}
                />
              </div>
              {/* Extra spacing for location details text below the map */}
              <div className="mt-4 text-muted-foreground">
                <p><span className="font-semibold text-foreground">Address:</span> {currentProperty.location?.address}</p>
                <p><span className="font-semibold text-foreground">City:</span> {currentProperty.location?.city}</p>
                <p><span className="font-semibold text-foreground">State/Region:</span> {currentProperty.location?.state}</p>
                <p><span className="font-semibold text-foreground">Country:</span> {currentProperty.location?.country}</p>
              </div>
            </div>
          </div>

          {/* Sidebar - Agent Info */}
          <div className="space-y-6">
            <div className="bg-card border rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="text-xl font-bold mb-6">Listed By</h3>
              <div 
                className="flex items-center gap-4 mb-6 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => router.push(`/agents/${currentProperty.agentId?._id}`)}
              >
                <div className="w-16 h-16 rounded-full bg-muted overflow-hidden">
                  <img 
                    src={
                      (currentProperty.agentId as any)?.agentProfile?.profileImage 
                        ? ((currentProperty.agentId as any).agentProfile.profileImage.startsWith('http') ? (currentProperty.agentId as any).agentProfile.profileImage : `${baseUrl}${(currentProperty.agentId as any).agentProfile.profileImage}`)
                        : "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80"
                    } 
                    alt="Agent Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-bold text-lg text-primary hover:underline">{currentProperty.agentId?.firstName} {currentProperty.agentId?.lastName}</p>
                  <p className="text-sm text-muted-foreground">View Agent Profile</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-5 h-5 text-primary" />
                  <span>{currentProperty.agentId?.email || "Contact for email"}</span>
                </div>
                {/* Fallback to user phone, or use agentProfile phone if it existed. User phone is fine */}
                {(currentProperty.agentId as any)?.phone && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="w-5 h-5 text-primary" />
                    <span>{(currentProperty.agentId as any).phone}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-3">
                <Button 
                  className="w-full h-12 text-md font-bold" 
                  onClick={() => router.push(`/agents/${currentProperty.agentId?._id}`)}
                >
                  View Full Profile
                </Button>
                
                {(currentProperty.agentId as any)?.agentProfile?.whatsapp && (
                  <Button 
                    className="w-full h-12 text-md font-bold bg-green-600 hover:bg-green-700" 
                    onClick={() => {
                      const num = (currentProperty.agentId as any).agentProfile.whatsapp.replace(/\D/g, '');
                      window.open(`https://wa.me/${num}`, '_blank');
                    }}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" /> Chat on WhatsApp
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
}
