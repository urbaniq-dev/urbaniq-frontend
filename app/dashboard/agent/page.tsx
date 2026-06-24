"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AgentDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({ properties: 0, pendingAssignments: 0, inquiries: 0, visits: 0, clients: 0, pendingOffers: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propRes, assignRes, inqRes, visRes, offRes] = await Promise.all([
          api.get(`/properties?agentId=${user?._id}`),
          api.get('/assignments'),
          api.get('/interactions/inquiries'),
          api.get('/interactions/visits'),
          api.get('/interactions/offers')
        ])
        
        const pending = assignRes.data.filter((a: any) => a.status === 'Pending').length
        const upcomingVisits = visRes.data.filter((v: any) => new Date(v.date).getTime() > new Date().getTime()).length
        
        // Mock unique clients from inquiries and visits
        const uniqueClients = new Set([
          ...inqRes.data.map((i: any) => i.buyerId._id),
          ...visRes.data.map((v: any) => v.buyerId._id)
        ]).size

        const pendingOffers = offRes.data.filter((o: any) => o.status === 'Pending').length

        setStats({ 
          properties: propRes.data.data ? propRes.data.data.length : propRes.data.length || 0,
          pendingAssignments: pending,
          inquiries: inqRes.data.length,
          visits: upcomingVisits,
          clients: uniqueClients,
          pendingOffers
        })
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (user) fetchData()
  }, [user])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Dashboard</h1>
          <p className="text-muted-foreground">Manage your portfolio and client interactions.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Managed Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.properties}</div>
          </CardContent>
        </Card>
        <Card className={`${stats.pendingAssignments > 0 ? 'border-primary shadow-sm' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.pendingAssignments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.inquiries}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.visits}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Offers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.pendingOffers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.clients}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Assignment Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground mb-4">You have {stats.pendingAssignments} pending requests.</p>
              <Button asChild variant="outline">
                <Link href="/dashboard/agent/assignments">View Requests</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Schedule</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground mb-4">You have {stats.visits} upcoming viewings.</p>
              <Button asChild variant="outline">
                <Link href="/dashboard/agent/visits">View Schedule</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-muted/20 rounded-xl border border-dashed">
              <div className="flex flex-col items-center justify-center p-4">
                <span className="text-4xl font-bold text-primary mb-2">92%</span>
                <span className="text-sm text-muted-foreground">Inquiry Response Rate</span>
              </div>
              <div className="w-px h-16 bg-border hidden md:block"></div>
              <div className="flex flex-col items-center justify-center p-4">
                <span className="text-4xl font-bold text-primary mb-2">15</span>
                <span className="text-sm text-muted-foreground">Deals Closed</span>
              </div>
              <div className="w-px h-16 bg-border hidden md:block"></div>
              <div className="flex flex-col items-center justify-center p-4">
                <span className="text-4xl font-bold text-green-500 mb-2">4.9</span>
                <span className="text-sm text-muted-foreground">Avg. Client Rating</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
