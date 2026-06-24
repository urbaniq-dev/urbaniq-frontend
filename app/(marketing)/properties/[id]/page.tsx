"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { MapPin, BedDouble, Bath, Square, Calendar as CalendarIcon, Clock, CheckCircle2, Heart, MessageSquare, Banknote, X } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import useAuthStore from "@/store/authStore"

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Scheduling State
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scheduledSuccess, setScheduledSuccess] = useState(false)

  // Favorite State
  const [isFavorite, setIsFavorite] = useState(false)

  // Modals State
  const [showInquiryModal, setShowInquiryModal] = useState(false)
  const [inquiryMessage, setInquiryMessage] = useState("")
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [offerAmount, setOfferAmount] = useState("")

  const timeSlots = ["09:00 AM", "10:30 AM", "01:00 PM", "03:30 PM", "05:00 PM"]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/properties/${params.id}`)
        setProperty(res.data?.data)

        if (user && user.role === 'Buyer') {
          const favRes = await api.get('/users/favorites')
          const isFav = favRes.data?.some((p: any) => p._id === params.id || p === params.id)
          setIsFavorite(isFav)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }
    if (params.id) fetchData()
  }, [params.id, user])

  const handleFavoriteToggle = async () => {
    if (!user) {
      router.push("/login")
      return
    }
    if (user.role !== 'Buyer') return

    try {
      if (isFavorite) {
        await api.delete(`/users/favorites/${property._id}`)
        setIsFavorite(false)
      } else {
        await api.post(`/users/favorites/${property._id}`)
        setIsFavorite(true)
      }
    } catch (err) {
      console.error("Failed to toggle favorite")
    }
  }

  const handleScheduleVisit = async () => {
    if (!user) {
      router.push("/login")
      return
    }
    if (!selectedDate || !selectedTime) return

    setIsSubmitting(true)
    try {
      await api.post("/interactions/visits", {
        propertyId: property._id,
        date: selectedDate.toISOString(),
        timeSlot: selectedTime
      })
      setScheduledSuccess(true)
    } catch (err) {
      console.error("Failed to schedule visit")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendInquiry = async () => {
    if (!inquiryMessage.trim()) return
    setIsSubmitting(true)
    try {
      await api.post("/interactions/inquiries", {
        propertyId: property._id,
        message: inquiryMessage
      })
      alert("Inquiry sent successfully!")
      setShowInquiryModal(false)
      setInquiryMessage("")
    } catch (err) {
      alert("Failed to send inquiry")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMakeOffer = async () => {
    if (!offerAmount) return
    setIsSubmitting(true)
    try {
      await api.post("/interactions/offers", {
        propertyId: property._id,
        amount: Number(offerAmount),
        paymentMethod: "Cash"
      })
      alert("Offer submitted successfully!")
      setShowOfferModal(false)
      setOfferAmount("")
    } catch (err) {
      alert("Failed to submit offer")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <div className="h-screen flex items-center justify-center">Loading property details...</div>
  if (!property) return <div className="h-screen flex items-center justify-center">Property not found</div>

  return (
    <div className="bg-background pb-20 relative">
      {/* Property Image Header */}
      <div className="relative h-[60vh] w-full bg-black">
        <Image 
          src={property.images?.[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80"}
          alt={property.title}
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-bold uppercase tracking-wider inline-block mb-4">
                  {property.status || "Available"}
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">{property.title}</h1>
                <div className="flex items-center text-gray-300 gap-2 text-lg">
                  <MapPin className="h-5 w-5" />
                  {property.location.address}, {property.location.city}, {property.location.state}
                </div>
              </div>
              
              {(!user || user.role === 'Buyer') && (
                <div className="flex gap-3">
                  <Button size="lg" variant={isFavorite ? "default" : "secondary"} className="gap-2" onClick={handleFavoriteToggle}>
                    <Heart className={`h-5 w-5 ${isFavorite ? "fill-white" : ""}`} /> 
                    {isFavorite ? "Saved" : "Save Property"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Main Details */}
          <div className="flex-1 space-y-10">
            {/* Price & Overview */}
            <div className="flex flex-wrap items-center justify-between gap-6 border-b pb-8">
              <div>
                <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-1">Asking Price</p>
                <p className="text-4xl font-bold text-primary">${property.price.toLocaleString()}</p>
              </div>
              <div className="flex gap-8">
                <div className="flex flex-col items-center">
                  <BedDouble className="h-6 w-6 text-muted-foreground mb-2" />
                  <span className="font-bold">{property.features.bedrooms} Beds</span>
                </div>
                <div className="flex flex-col items-center">
                  <Bath className="h-6 w-6 text-muted-foreground mb-2" />
                  <span className="font-bold">{property.features.bathrooms} Baths</span>
                </div>
                <div className="flex flex-col items-center">
                  <Square className="h-6 w-6 text-muted-foreground mb-2" />
                  <span className="font-bold">{property.features.area} sqft</span>
                </div>
              </div>
            </div>

            {/* Interaction Buttons (Inquiry / Offer) */}
            {(!user || user.role === 'Buyer') && (
              <div className="flex gap-4">
                <Button size="lg" variant="outline" className="flex-1 gap-2" onClick={() => {
                  if (!user) return router.push("/login")
                  setShowInquiryModal(true)
                }}>
                  <MessageSquare className="h-5 w-5" /> Send Inquiry
                </Button>
                <Button size="lg" className="flex-1 gap-2" onClick={() => {
                  if (!user) return router.push("/login")
                  setShowOfferModal(true)
                }}>
                  <Banknote className="h-5 w-5" /> Make Offer (Cash)
                </Button>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-2xl font-bold mb-4">About this Property</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {property.description}
              </p>
            </div>
          </div>

          {/* Interactive Scheduling Widget */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="sticky top-24">
              <Card className="border-2 shadow-xl">
                <CardContent className="p-6">
                  {scheduledSuccess ? (
                    <div className="text-center py-8 animate-in zoom-in duration-500">
                      <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="h-10 w-10" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Visit Scheduled!</h3>
                      <p className="text-muted-foreground mb-6">
                        Your request for {selectedDate?.toLocaleDateString()} at {selectedTime} has been confirmed. The agent will contact you shortly.
                      </p>
                      <Button onClick={() => router.push("/dashboard/buyer/visits")} className="w-full">
                        View in Dashboard
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold mb-2">Schedule a Visit</h3>
                      
                      {user && user.role !== 'Buyer' ? (
                        <div className="p-4 bg-muted rounded-md text-center mb-4 border border-dashed">
                          <p className="text-sm font-medium text-muted-foreground">You are logged in as an {user.role}. Only Buyers can schedule visits.</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mb-6">Select a date and time to view this property.</p>
                      )}
                      
                      <div className="mb-6">
                        <Calendar 
                          selectedDate={selectedDate}
                          onSelectDate={(date) => {
                             setSelectedDate(date)
                             setSelectedTime("") // Reset time when date changes
                          }}
                          minDate={new Date()}
                        />
                      </div>

                      {/* Time Slots (Only visible when date is selected) */}
                      {selectedDate && (
                        <div className="space-y-3 mb-6 animate-in fade-in slide-in-from-top-2">
                          <p className="text-sm font-medium">Available Times for {selectedDate.toLocaleDateString()}</p>
                          <div className="grid grid-cols-2 gap-2">
                            {timeSlots.map(time => (
                              <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={`py-2 px-3 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-all border
                                  ${selectedTime === time 
                                    ? 'bg-primary border-primary text-primary-foreground shadow-md' 
                                    : 'bg-background hover:border-primary/50 text-foreground'}
                                `}
                              >
                                <Clock className="h-3.5 w-3.5" />
                                {time}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button 
                        className="w-full h-12 text-lg font-semibold"
                        disabled={!selectedDate || !selectedTime || isSubmitting || !!(user && user.role !== 'Buyer')}
                        onClick={handleScheduleVisit}
                      >
                        {isSubmitting ? "Scheduling..." : "Confirm Visit"}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          
        </div>
      </div>

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-lg p-6 relative">
            <button onClick={() => setShowInquiryModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold mb-2">Send an Inquiry</h2>
            <p className="text-muted-foreground mb-6">Ask the agent or owner any questions you have about {property.title}.</p>
            
            <textarea 
              className="w-full h-32 p-3 rounded-md border bg-muted/50 focus:bg-background focus:ring-2 focus:ring-primary focus:outline-none mb-6"
              placeholder="What would you like to know?"
              value={inquiryMessage}
              onChange={(e) => setInquiryMessage(e.target.value)}
            ></textarea>
            
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowInquiryModal(false)}>Cancel</Button>
              <Button onClick={handleSendInquiry} disabled={isSubmitting || !inquiryMessage.trim()}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-lg p-6 relative">
            <button onClick={() => setShowOfferModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold mb-2">Make an Offer</h2>
            <p className="text-muted-foreground mb-6">Submit your cash offer for {property.title}. The current asking price is ${property.price.toLocaleString()}.</p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Offer Amount (Cash)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                <input 
                  type="number"
                  className="w-full p-3 pl-8 rounded-md border bg-muted/50 focus:bg-background focus:ring-2 focus:ring-primary focus:outline-none text-lg font-semibold"
                  placeholder="e.g. 500000"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowOfferModal(false)}>Cancel</Button>
              <Button onClick={handleMakeOffer} disabled={isSubmitting || !offerAmount}>
                {isSubmitting ? "Submitting..." : "Submit Offer"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
