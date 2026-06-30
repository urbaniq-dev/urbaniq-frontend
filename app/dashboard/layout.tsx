"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Building2, LayoutDashboard, Heart, Calendar, MessageSquare, Settings, LogOut } from "lucide-react"
import { useAuthStore } from "@/store/authStore"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
<<<<<<< Updated upstream
=======
  const pathname = usePathname()
>>>>>>> Stashed changes
  const { user, isAuthenticated, isLoading, initialize, logout } = useAuthStore()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    initialize()
  }, [initialize])

  useEffect(() => {
    if (isClient && !isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isClient, isLoading, isAuthenticated, router])

  if (!isClient || isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`
    }
    return "U"
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background">
        <div className="flex h-16 items-center px-6 border-b">
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight">Urbaniq</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid gap-1 px-4">
            <Link href={`/dashboard/${user?.role.toLowerCase()}`} className="flex items-center gap-3 rounded-lg px-3 py-2 text-primary bg-primary/5 transition-all">
              <LayoutDashboard className="h-4 w-4" />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/5">
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium">My Properties</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/5">
              <Heart className="h-4 w-4" />
              <span className="text-sm font-medium">Saved</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/5">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Visits</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/5">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm font-medium">Inquiries</span>
            </Link>
          </nav>
        </div>
        
        <div className="border-t p-4">
          <nav className="grid gap-1">
            <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/5">
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium">Settings</span>
            </Link>
            <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-red-500 hover:bg-red-500/10">
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </nav>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-background px-6">
          <div className="font-semibold md:hidden">Urbaniq</div>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
             <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
               {getInitials()}
             </div>
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
