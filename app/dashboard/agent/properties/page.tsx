"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"

interface Property {
  _id: string;
  title: string;
  location: { city: string; state: string };
  price: number;
  status: string;
}

export default function AgentPropertiesPage() {
  const { user } = useAuthStore()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProperties = async () => {
      if (!user?._id) return
      try {
        const res = await api.get(`/properties?agentId=${user._id}`)
        setProperties(res.data.data)
      } catch (error) {
        console.error("Failed to fetch properties:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProperties()
  }, [user])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Managed Properties</h1>
          <p className="text-muted-foreground">Properties currently assigned to you for management.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                 <tr>
                   <th className="px-6 py-4 rounded-tl-lg">Property Name</th>
                   <th className="px-6 py-4">Location</th>
                   <th className="px-6 py-4">Price</th>
                   <th className="px-6 py-4">Status</th>
                   <th className="px-6 py-4 rounded-tr-lg">Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {loading ? (
                   <tr>
                     <td colSpan={5} className="text-center py-12 text-muted-foreground">Loading properties...</td>
                   </tr>
                 ) : properties.length === 0 ? (
                   <tr>
                     <td colSpan={5} className="text-center py-12 text-muted-foreground">You have no active managed properties.</td>
                   </tr>
                 ) : (
                   properties.map(property => (
                     <tr key={property._id} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                       <td className="px-6 py-4 font-medium">{property.title}</td>
                       <td className="px-6 py-4 text-muted-foreground">{property.location.city}, {property.location.state}</td>
                       <td className="px-6 py-4 font-medium">{formatPrice(property.price)}</td>
                       <td className="px-6 py-4">
                         <span className={`px-2 py-1 rounded-full text-xs font-semibold ${property.status === 'Available' || property.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                           {property.status}
                         </span>
                       </td>
                       <td className="px-6 py-4">
                         <Button variant="outline" size="sm">Update Status</Button>
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>
        </CardContent>
      </Card>
    </div>
  )
}
