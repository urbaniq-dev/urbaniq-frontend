"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BarChart, Clock, MapPin, Building2, Banknote } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { useSocket } from "@/components/providers/SocketProvider"

export default function BuyerOffersPage() {
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { socket } = useSocket()

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await api.get("/interactions/offers")
        setOffers(res.data)
      } catch (err) {
        console.error("Failed to fetch offers:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchOffers()
  }, [])

  useEffect(() => {
    if (!socket) return

    const handleOfferUpdate = (updatedOffer: any) => {
      setOffers(prev => prev.map(o => o._id === updatedOffer._id ? { ...o, status: updatedOffer.status } : o))
    }

    socket.on('offer_updated', handleOfferUpdate)
    return () => {
      socket.off('offer_updated', handleOfferUpdate)
    }
  }, [socket])

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Offers</h1>
        <p className="text-muted-foreground mt-1">Track the status of cash offers you've submitted.</p>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <Banknote className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-bold mb-2">No offers made yet</h3>
          <p className="text-muted-foreground mb-6">You haven't submitted any offers for properties.</p>
          <Button asChild>
            <Link href="/properties">Browse Properties</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {offers.map(offer => (
            <div key={offer._id} className="p-6 bg-card rounded-xl border shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider
                      ${offer.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                        offer.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        offer.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'}`}>
                      {offer.status}
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center">
                      <Clock className="mr-1 h-3.5 w-3.5" /> Submitted on {new Date(offer.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Link href={`/properties/${offer.propertyId?._id}`} className="text-xl font-bold hover:underline inline-block">
                    {offer.propertyId?.title || "Unknown Property"}
                  </Link>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <MapPin className="mr-1 h-4 w-4" /> {offer.propertyId?.location?.city}, {offer.propertyId?.location?.state}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Offer Amount</p>
                  <p className="text-2xl font-bold text-primary">${offer.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Payment: {offer.paymentMethod}</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between text-sm items-center pt-2">
                <div className="text-muted-foreground">
                  Current Asking Price: <span className="font-semibold text-foreground">${offer.propertyId?.price?.toLocaleString() || "N/A"}</span>
                </div>
                {offer.agentId && (
                  <div className="text-muted-foreground mt-2 md:mt-0">
                    Agent: <span className="font-semibold text-foreground">{offer.agentId.firstName} {offer.agentId.lastName}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
