"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Clock, MapPin, Banknote, CheckCircle2, XCircle } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { useSocket } from "@/components/providers/SocketProvider"

export default function AgentOffersPage() {
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { socket } = useSocket()

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

  useEffect(() => {
    fetchOffers()
  }, [])

  useEffect(() => {
    if (!socket) return

    const handleNewInteraction = (data: any) => {
      if (data.type === 'Offer') {
        fetchOffers()
      }
    }

    socket.on('new_interaction', handleNewInteraction)
    return () => {
      socket.off('new_interaction', handleNewInteraction)
    }
  }, [socket])

  const updateOfferStatus = async (offerId: string, status: string) => {
    try {
      await api.put(`/interactions/offers/${offerId}`, { status })
      setOffers(prev => prev.map(o => o._id === offerId ? { ...o, status } : o))
    } catch (error) {
      console.error("Failed to update offer status:", error)
    }
  }

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Client Offers</h1>
        <p className="text-muted-foreground mt-1">Review and manage cash offers for your assigned properties.</p>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <Banknote className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-bold mb-2">No offers received yet</h3>
          <p className="text-muted-foreground mb-6">There are currently no cash offers for your assigned properties.</p>
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
                      <Clock className="mr-1 h-3.5 w-3.5" /> Received on {new Date(offer.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Link href={`/dashboard/agent/properties/${offer.propertyId?._id}`} className="text-xl font-bold hover:underline inline-block">
                    {offer.propertyId?.title || "Unknown Property"}
                  </Link>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <MapPin className="mr-1 h-4 w-4" /> {offer.propertyId?.location?.city}, {offer.propertyId?.location?.state}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Offer Amount</p>
                  <p className="text-2xl font-bold text-primary">${offer.amount?.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Payment: {offer.paymentMethod}</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between text-sm items-start md:items-center pt-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
                    {offer.buyerId?.firstName?.[0]}{offer.buyerId?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{offer.buyerId?.firstName} {offer.buyerId?.lastName}</p>
                    <p className="text-xs text-muted-foreground">{offer.buyerId?.email} • {offer.buyerId?.phone || 'No phone'}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="text-muted-foreground text-right text-xs">
                    Asking Price: <span className="font-semibold text-foreground">${offer.propertyId?.price?.toLocaleString() || "N/A"}</span>
                  </div>
                  {offer.status === 'Pending' && (
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => updateOfferStatus(offer._id, 'Accepted')} className="border-green-200 hover:bg-green-50 text-green-700">
                        <CheckCircle2 className="h-4 w-4 mr-1.5" /> Accept
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => updateOfferStatus(offer._id, 'Rejected')} className="text-red-600 hover:bg-red-50 hover:text-red-700">
                        <XCircle className="h-4 w-4 mr-1.5" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
