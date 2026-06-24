"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ChevronLeft, User, Star, MapPin, CheckCircle2 } from "lucide-react"
import api from "@/lib/api"

interface Agent {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function AssignAgentPage() {
  const { id } = useParams()
  const router = useRouter()
  const [property, setProperty] = useState<any>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAgentId, setSelectedAgentId] = useState("")
  const [commissionInfo, setCommissionInfo] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propRes, agentsRes] = await Promise.all([
          api.get(`/properties/${id}`),
          api.get("/users/agents")
        ])
        setProperty(propRes.data.data)
        setAgents(agentsRes.data)
      } catch (err) {
        console.error("Failed to fetch data:", err)
        setError("Failed to load necessary data.")
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchData()
  }, [id])

  const filteredAgents = agents.filter(a => 
    `${a.firstName} ${a.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async () => {
    if (!selectedAgentId) {
      setError("Please select an agent.")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      await api.post("/assignments", {
        propertyId: id,
        agentId: selectedAgentId,
        commissionInfo
      })
      router.push(`/dashboard/owner/properties/${id}`)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send assignment request")
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading assignment flow...</div>
  }

  if (!property) {
    return <div className="p-8 text-center">Property not found.</div>
  }

  if (property.agentId) {
    return (
      <div className="p-8 text-center space-y-4 max-w-lg mx-auto mt-12">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold">Agent Already Assigned</h2>
        <p className="text-muted-foreground">This property is already being managed by an agent.</p>
        <Button onClick={() => router.push(`/dashboard/owner/properties/${id}`)}>Return to Property</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <Button variant="ghost" onClick={() => router.back()} className="mb-2 -ml-4 text-muted-foreground hover:text-foreground">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Property
      </Button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Assign an Agent</h1>
        <p className="text-muted-foreground">
          Select a verified Urbaniq agent to manage <strong>{property.title}</strong>.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-8">
        {/* Left Col: Agent Selection */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Available Agents</CardTitle>
              <CardDescription>Browse our network of certified real estate professionals.</CardDescription>
              <div className="relative mt-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search agents by name or email..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {filteredAgents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No agents found matching your search.</div>
              ) : (
                filteredAgents.map(agent => (
                  <div 
                    key={agent._id} 
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedAgentId === agent._id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedAgentId(agent._id)}
                  >
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-base truncate">{agent.firstName} {agent.lastName}</h4>
                        <div className="flex items-center text-sm text-yellow-500 shrink-0">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="ml-1 font-medium text-foreground">4.9</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{agent.email}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> Local Expert</span>
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500"/> Verified</span>
                      </div>
                    </div>
                    <div className="shrink-0 self-center">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAgentId === agent._id ? 'border-primary' : 'border-muted-foreground'}`}>
                        {selectedAgentId === agent._id && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Assignment Details */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Assignment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Property</label>
                <div className="bg-muted/50 p-3 rounded-md text-sm border font-medium truncate">
                  {property.title}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Selected Agent</label>
                <div className={`p-3 rounded-md text-sm border ${selectedAgentId ? 'bg-primary/5 border-primary/20 text-primary font-medium' : 'bg-muted/50 text-muted-foreground'}`}>
                  {selectedAgentId ? (
                    agents.find(a => a._id === selectedAgentId)?.firstName + ' ' + agents.find(a => a._id === selectedAgentId)?.lastName
                  ) : 'None selected'}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Commission Note (Optional)</label>
                <Input 
                  value={commissionInfo} 
                  onChange={(e) => setCommissionInfo(e.target.value)} 
                  placeholder="e.g. 5% of final sale price" 
                />
                <p className="text-xs text-muted-foreground">This note will be attached to the request.</p>
              </div>

              {error && (
                <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleSubmit} 
                disabled={!selectedAgentId || submitting}
              >
                {submitting ? "Sending Request..." : "Send Request to Agent"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
