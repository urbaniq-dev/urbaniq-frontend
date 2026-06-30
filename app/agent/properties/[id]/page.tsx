'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, Bed, Bath, Square, CheckCircle2, Phone, Mail, User, MessageCircle } from 'lucide-react';
import { usePropertyStore } from '@/store/propertyStore';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function PropertyDetailPage() {
  const params = useParams();
  const { id } = params as { id: string };
  const { currentProperty: property, isLoading, error, fetchPropertyById } = usePropertyStore();

  useEffect(() => {
    if (id) {
      fetchPropertyById(id);
    }
  }, [id, fetchPropertyById]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex justify-center items-center text-destructive">
        <p className="text-xl font-semibold">{error || 'Property not found'}</p>
      </div>
    );
  }

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
  const getImgSrc = (url: string | undefined) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${BASE_URL}${url}`;
  };

  return (
    <div className="min-h-screen bg-muted/10 pb-20 pt-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
        >
          <div>
            <div className="flex gap-2 mb-3">
              <Badge variant="default" className="bg-primary hover:bg-primary/90 text-sm">
                {property.status}
              </Badge>
              <Badge variant="secondary" className="text-sm">
                {property.propertyType}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">{property.title}</h1>
            <div className="flex items-center text-muted-foreground text-lg">
              <MapPin className="w-5 h-5 mr-1" />
              <span>{property.location.address}, {property.location.city}, {property.location.state} {property.location.zipCode}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground mb-1 uppercase tracking-wider text-sm font-semibold">Asking Price</p>
            <p className="text-4xl font-bold text-primary">${property.price?.toLocaleString()}</p>
          </div>
        </motion.div>

        {/* Image Gallery (Placeholder for multi-image) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="relative h-[400px] md:h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={property.images?.[0] ? (property.images[0].startsWith('http') ? property.images[0] : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001'}${property.images[0]}`) : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'}
              alt={property.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-md">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-6">Property Overview</h2>
                <div className="flex flex-wrap gap-8 py-6 border-y border-border mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                      <Bed className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Bedrooms</p>
                      <p className="font-semibold text-lg">{property.features.bedrooms}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                      <Bath className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Bathrooms</p>
                      <p className="font-semibold text-lg">{property.features.bathrooms}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                      <Square className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Area</p>
                      <p className="font-semibold text-lg">{property.features.area} sqft</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-3">Description</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </CardContent>
            </Card>

            {/* Image Gallery */}
            {property.images && property.images.length > 1 && (
              <Card className="border-none shadow-md">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold mb-6">Property Gallery</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {property.images.slice(1).map((image: string, index: number) => {
                      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
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
                </CardContent>
              </Card>
            )}

            {property.amenities && property.amenities.length > 0 && (
              <Card className="border-none shadow-md">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold mb-6">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.amenities.map((amenity: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-muted-foreground">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar / Contact Agent */}
          <div className="space-y-6">
            <Card className="border-none shadow-xl bg-card sticky top-24">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-6">Contact Information</h3>
                
                {property.agentId ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-muted rounded-full overflow-hidden relative">
                        {getImgSrc((property.agentId as any)?.agentProfile?.profileImage || property.agentId.profileImage) ? (
                           <Image src={getImgSrc((property.agentId as any)?.agentProfile?.profileImage || property.agentId.profileImage)!} alt="Agent" fill className="object-cover" unoptimized />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                             <User className="w-8 h-8" />
                           </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{property.agentId.firstName} {property.agentId.lastName}</p>
                        <p className="text-sm text-muted-foreground">Listing Agent</p>
                      </div>
                    </div>
                    <div className="space-y-3 pt-4 border-t border-border">
                      {((property.agentId as any)?.agentProfile?.phone || property.agentId.phone) && (
                        <a href={`tel:${(property.agentId as any)?.agentProfile?.phone || property.agentId.phone}`} className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                          <Phone className="w-5 h-5 text-primary" />
                          <span>{(property.agentId as any)?.agentProfile?.phone || property.agentId.phone}</span>
                        </a>
                      )}
                      {(property.agentId as any)?.agentProfile?.whatsapp && (
                        <a
                          href={`https://wa.me/${(property.agentId as any).agentProfile.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-muted-foreground hover:text-green-600 transition-colors"
                        >
                          <MessageCircle className="w-5 h-5 text-green-500" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                      {property.agentId.email && (
                        <a href={`mailto:${property.agentId.email}`} className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                          <Mail className="w-5 h-5" />
                          <span className="truncate">{property.agentId.email}</span>
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-muted rounded-full overflow-hidden flex items-center justify-center">
                         <User className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{property.ownerId?.firstName} {property.ownerId?.lastName}</p>
                        <p className="text-sm text-muted-foreground">Property Owner</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <Button className="w-full mt-8 h-12 text-lg shadow-md hover:shadow-xl transition-all">
                  Request Info
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
