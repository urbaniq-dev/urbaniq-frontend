"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Building2, Calendar as CalendarIcon, Clock, MapPin } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { useSocket } from "@/components/providers/SocketProvider"

export default function BuyerVisitsPage() {
  const [visits, setVisits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { socket } = useSocket()

  useEffect(() => {
    fetchVisits()
  }, [])

  useEffect(() => {
    if (!socket) return

    const handleVisitUpdate = (updatedVisit: any) => {
      setVisits(prev => prev.map(v => v._id === updatedVisit._id ? { ...v, status: updatedVisit.status } : v))
    }

    socket.on('visit_updated', handleVisitUpdate)
    return () => {
      socket.off('visit_updated', handleVisitUpdate)
    }
  }, [socket])

  const fetchVisits = async () => {
    try {
      const res = await api.get("/interactions/visits")
      setVisits(res.data)
    } catch (err) {
      console.error("Failed to fetch visits:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelVisit = async (visitId: string) => {
    try {
      await api.put(`/interactions/visits/${visitId}`, { status: 'Cancelled' })
      setVisits(prev => prev.map(v => v._id === visitId ? { ...v, status: 'Cancelled' } : v))
    } catch (err) {
      alert("Failed to cancel visit")
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scheduled Visits</h1>
        <p className="text-muted-foreground mt-1">Manage your upcoming property viewings.</p>
      </div>

      {visits.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-bold mb-2">No visits scheduled yet</h3>
          <p className="text-muted-foreground mb-6">You haven't scheduled any property viewings.</p>
          <Button asChild>
            <Link href="/properties">Browse Properties</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {visits.map(visit => (
            <div key={visit._id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-card rounded-xl border shadow-sm gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider
                    ${visit.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                      visit.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      visit.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'}`}>
                    {visit.status}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground flex items-center">
                    <Clock className="mr-1 h-3.5 w-3.5" /> Scheduled
                  </span>
                </div>
                <Link href={`/properties/${visit.propertyId?._id}`} className="text-xl font-bold hover:underline inline-block">
                  {visit.propertyId?.title || "Unknown Property"}
                </Link>
                <div className="flex items-center text-sm text-muted-foreground gap-4">
                  <span className="flex items-center"><CalendarIcon className="mr-1 h-4 w-4" /> {new Date(visit.date).toLocaleDateString()} at {visit.timeSlot}</span>
                  <span className="flex items-center"><MapPin className="mr-1 h-4 w-4" /> {visit.propertyId?.location?.city}, {visit.propertyId?.location?.state}</span>
                </div>
              </div>

              <div className="flex flex-col md:items-end space-y-2 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 mt-2 md:mt-0 min-w-[150px]">
                <div>
                  <p className="text-sm text-muted-foreground">Assigned Agent</p>
                  <p className="font-semibold">{visit.agentId?.firstName} {visit.agentId?.lastName}</p>
                  <p className="text-sm text-primary">{visit.agentId?.phone}</p>
                </div>
                {visit.status === 'Pending' && (
                  <Button variant="destructive" size="sm" className="w-full mt-2" onClick={() => handleCancelVisit(visit._id)}>
                    Cancel Visit
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
