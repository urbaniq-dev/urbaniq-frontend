"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, LineChart, TrendingUp, Users, Eye, CalendarCheck, Percent } from "lucide-react"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"

export default function OwnerAnalyticsPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({ views: 0, inquiries: 0, visits: 0, conversion: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?._id) return
      try {
        const [propRes, inqRes, visRes] = await Promise.all([
          api.get(`/properties?ownerId=${user._id}`),
          api.get('/interactions/inquiries'),
          api.get('/interactions/visits')
        ])
        
        const properties = Array.isArray(propRes.data.data) ? propRes.data.data : []
        const views = properties.reduce((acc: number, p: any) => acc + (p.views || 0), 0)
        const inquiries = inqRes.data.length
        const visits = visRes.data.length
        const conversion = views > 0 ? ((inquiries / views) * 100).toFixed(1) : 0

        setStats({ views, inquiries, visits, conversion: Number(conversion) })
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [user])

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Property Analytics</h1>
        <p className="text-muted-foreground">Detailed performance metrics across your real estate portfolio.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : stats.views}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" /> +14% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : stats.inquiries}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" /> +5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Visits</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : stats.visits}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" /> +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : `${stats.conversion}%`}</div>
            <p className="text-xs text-muted-foreground mt-1">Views to Inquiries</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Views Over Time</CardTitle>
            <CardDescription>Monthly property view metrics</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-muted/10 rounded-md border border-dashed m-6 mt-0 relative overflow-hidden">
             {/* Mock Chart Area */}
             <div className="absolute inset-0 flex items-end justify-between px-8 pt-12 pb-8">
               {[40, 70, 45, 90, 65, 85, 120].map((h, i) => (
                 <div key={i} className="w-12 bg-primary/20 rounded-t-sm hover:bg-primary/40 transition-colors" style={{ height: `${h}%` }}></div>
               ))}
             </div>
             <LineChart className="h-12 w-12 text-muted-foreground/30 absolute" />
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Inquiry Sources</CardTitle>
            <CardDescription>Where your leads are coming from</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-muted/10 rounded-md border border-dashed m-6 mt-0 relative overflow-hidden">
             {/* Mock Chart Area */}
             <div className="w-48 h-48 rounded-full border-[16px] border-primary/20 border-r-primary border-t-primary/60 border-l-primary/40"></div>
             <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold">100%</span>
                <span className="text-xs text-muted-foreground">Organic</span>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
