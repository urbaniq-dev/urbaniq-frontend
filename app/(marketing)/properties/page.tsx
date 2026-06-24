"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, MapPin, BedDouble, Bath, Square, SlidersHorizontal } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface Property {
  _id: string;
  title: string;
  price: number;
  location: { city: string; state: string; address: string };
  features: { bedrooms: number; bathrooms: number; area: number };
  propertyType: string;
  images: string[];
}

export default function PropertiesListingPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await api.get("/properties")
        setProperties(res.data?.data || [])
      } catch (err) {
        console.error("Failed to fetch properties:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProperties()
  }, [])

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.location.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-background min-h-screen">
      {/* Search Header */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Find Your Next Investment</h1>
          <p className="text-lg opacity-90 mb-8 max-w-2xl">Browse our curated selection of verified premium properties across top global markets.</p>
          
          <div className="bg-background rounded-xl p-2 flex flex-col md:flex-row gap-2 max-w-4xl shadow-xl">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input 
                placeholder="Search by city, neighborhood, or title..." 
                className="pl-10 h-12 border-0 focus-visible:ring-0 text-foreground"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="hidden md:block w-[1px] bg-border my-2"></div>
            <div className="flex gap-2">
              <Button variant="outline" className="h-12 text-foreground border-0 hover:bg-muted shrink-0 px-4">
                <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
              </Button>
              <Button className="h-12 px-8 font-semibold shrink-0">Search</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Property Grid */}
      <div className="container mx-auto px-4 py-12 max-w-screen-xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">
             {loading ? "Loading properties..." : `${filteredProperties.length} Properties Found`}
          </h2>
          <select className="border rounded-md px-3 py-2 text-sm bg-background">
            <option>Sort by: Newest</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-muted h-[400px] rounded-xl"></div>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
             <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
             <h3 className="text-xl font-semibold mb-2">No properties match your search</h3>
             <p className="text-muted-foreground">Try adjusting your filters or search term.</p>
             <Button variant="link" onClick={() => setSearchTerm("")} className="mt-4">Clear all filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map(property => (
              <Link href={`/properties/${property._id}`} key={property._id} className="group block">
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-border group-hover:-translate-y-1">
                  <div className="relative h-[240px] w-full bg-muted">
                    <Image 
                      src={property.images?.[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                      alt={property.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md">
                      {property.propertyType}
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors truncate pr-4">
                        {property.title}
                      </h3>
                      <p className="font-bold text-primary shrink-0">${property.price.toLocaleString()}</p>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <MapPin className="h-3.5 w-3.5 mr-1 shrink-0" />
                      <span className="truncate">{property.location.city}, {property.location.state}</span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t text-sm font-medium text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BedDouble className="h-4 w-4" /> <span>{property.features.bedrooms}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="h-4 w-4" /> <span>{property.features.bathrooms}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Square className="h-4 w-4" /> <span>{property.features.area} sqft</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
