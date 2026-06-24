"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import { MessageSquare, Calendar as CalendarIcon, Phone, Mail, User } from "lucide-react"
import { useSocket } from "@/components/providers/SocketProvider"

interface Inquiry {
  _id: string;
  propertyId: {
    _id: string;
    title: string;
    location: { city: string; state: string };
    price: number;
  };
  buyerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  message: string;
  status: string;
  replyMessage?: string;
  createdAt: string;
}

export default function AgentInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const { socket } = useSocket()

  const fetchInquiries = async () => {
    try {
      const res = await api.get("/interactions/inquiries")
      setInquiries(res.data)
    } catch (error) {
      console.error("Failed to fetch inquiries:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInquiries()
  }, [])

  useEffect(() => {
    if (!socket) return

    const handleNewInteraction = (data: any) => {
      if (data.type === 'Inquiry') {
        fetchInquiries()
      }
    }

    socket.on('new_interaction', handleNewInteraction)
    return () => {
      socket.off('new_interaction', handleNewInteraction)
    }
  }, [socket])

  const [replyText, setReplyText] = useState<{ [key: string]: string }>({})
  const [submitting, setSubmitting] = useState<string | null>(null)

  const handleReply = async (inquiryId: string) => {
    const text = replyText[inquiryId]
    if (!text) return

    setSubmitting(inquiryId)
    try {
      await api.put(`/interactions/inquiries/${inquiryId}`, {
        status: 'Replied',
        replyMessage: text
      })
      setInquiries(prev => prev.map(i => i._id === inquiryId ? { ...i, status: 'Replied', replyMessage: text } : i))
      setReplyText(prev => ({ ...prev, [inquiryId]: '' }))
    } catch (error) {
      console.error("Failed to send reply:", error)
    } finally {
      setSubmitting(null)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Buyer Inquiries</h1>
        <p className="text-muted-foreground">Manage messages from potential buyers for your properties.</p>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading inquiries...</div>
        ) : inquiries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">No Inquiries Yet</h3>
              <p className="text-muted-foreground mt-1 max-w-sm">When buyers are interested in your properties, their messages will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          inquiries.map((inquiry) => (
            <Card key={inquiry._id} className="overflow-hidden transition-all hover:shadow-md">
              <div className="flex flex-col md:flex-row">
                {/* Left Side: Property Info */}
                <div className="bg-muted/30 p-6 md:w-1/3 border-b md:border-b-0 md:border-r flex flex-col justify-center">
                  <div className="text-sm text-primary font-medium mb-1">Regarding</div>
                  <h3 className="font-bold text-lg leading-tight">{inquiry.propertyId.title}</h3>
                  <p className="text-muted-foreground text-sm mt-2">{inquiry.propertyId.location.city}, {inquiry.propertyId.location.state}</p>
                  <p className="font-semibold mt-4 text-lg">
                    ${inquiry.propertyId.price.toLocaleString()}
                  </p>
                </div>

                {/* Right Side: Message & Buyer Info */}
                <div className="p-6 md:w-2/3 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {inquiry.buyerId.firstName[0]}{inquiry.buyerId.lastName[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-base">{inquiry.buyerId.firstName} {inquiry.buyerId.lastName}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" /> {formatDate(inquiry.createdAt)}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${inquiry.status === 'Replied' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {inquiry.status || 'New'}
                    </span>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 mb-4 flex-1 text-sm leading-relaxed border">
                    <p className="font-medium mb-1">Message:</p>
                    &quot;{inquiry.message}&quot;
                  </div>

                  {inquiry.status === 'Replied' && inquiry.replyMessage ? (
                    <div className="bg-primary/5 rounded-lg p-4 mb-6 flex-1 text-sm leading-relaxed border border-primary/20">
                      <p className="font-medium text-primary mb-1">Your Reply:</p>
                      {inquiry.replyMessage}
                    </div>
                  ) : (
                    <div className="flex gap-2 mb-6">
                      <input 
                        type="text" 
                        placeholder="Type a quick reply..." 
                        className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                        value={replyText[inquiry._id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [inquiry._id]: e.target.value })}
                      />
                      <Button 
                        onClick={() => handleReply(inquiry._id)}
                        disabled={!replyText[inquiry._id] || submitting === inquiry._id}
                      >
                        {submitting === inquiry._id ? "Sending..." : "Reply"}
                      </Button>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-4 mt-auto">
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                        <Mail className="h-4 w-4" /> {inquiry.buyerId.email}
                      </div>
                      {inquiry.buyerId.phone && (
                        <div className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                          <Phone className="h-4 w-4" /> {inquiry.buyerId.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
