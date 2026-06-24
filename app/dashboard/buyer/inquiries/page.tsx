"use client"

import { formatDistanceToNow } from "date-fns"
import { useSocket } from "@/components/providers/SocketProvider"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Building2, MessageSquare, Clock, MapPin } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function BuyerInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { socket } = useSocket()

  useEffect(() => {
    fetchInquiries()
  }, [])

  useEffect(() => {
    if (!socket) return

    const handleInquiryUpdate = (updatedInquiry: any) => {
      setInquiries(prev => prev.map(i => i._id === updatedInquiry._id ? { ...i, status: updatedInquiry.status, replyMessage: updatedInquiry.replyMessage } : i))
    }

    socket.on('inquiry_updated', handleInquiryUpdate)
    return () => {
      socket.off('inquiry_updated', handleInquiryUpdate)
    }
  }, [socket])

  const fetchInquiries = async () => {
    try {
      const res = await api.get("/interactions/inquiries")
      setInquiries(res.data)
    } catch (err) {
      console.error("Failed to fetch inquiries:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseInquiry = async (inquiryId: string) => {
    try {
      await api.put(`/interactions/inquiries/${inquiryId}`, { status: 'Closed' })
      setInquiries(prev => prev.map(i => i._id === inquiryId ? { ...i, status: 'Closed' } : i))
    } catch (err) {
      alert("Failed to close inquiry")
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sent Inquiries</h1>
        <p className="text-muted-foreground mt-1">Track questions you've sent to agents and owners.</p>
      </div>

      {inquiries.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-bold mb-2">No inquiries sent yet</h3>
          <p className="text-muted-foreground mb-6">You haven't contacted any property representatives.</p>
          <Button asChild>
            <Link href="/properties">Browse Properties</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {inquiries.map(inquiry => (
            <div key={inquiry._id} className="p-6 bg-card rounded-xl border shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider
                      ${inquiry.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                        inquiry.status === 'Open' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'}`}>
                      {inquiry.status}
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center">
                      <Clock className="mr-1 h-3.5 w-3.5" /> Sent on {new Date(inquiry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Link href={`/properties/${inquiry.propertyId?._id}`} className="text-xl font-bold hover:underline inline-block">
                    {inquiry.propertyId?.title || "Unknown Property"}
                  </Link>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <MapPin className="mr-1 h-4 w-4" /> {inquiry.propertyId?.location?.city}, {inquiry.propertyId?.location?.state}
                  </p>
                </div>
                
                {inquiry.status !== 'Closed' && (
                  <Button variant="outline" size="sm" onClick={() => handleCloseInquiry(inquiry._id)}>
                    Close Inquiry
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Your Message</p>
                  <p className="text-sm leading-relaxed">{inquiry.message}</p>
                </div>

                {inquiry.replyMessage && (
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Reply</p>
                    <p className="text-sm leading-relaxed">{inquiry.replyMessage}</p>
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
