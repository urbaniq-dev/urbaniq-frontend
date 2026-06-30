"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Building2, LayoutDashboard, Calendar, MessageSquare, Settings, LogOut, Home, Users } from "lucide-react"
import { useAuthStore } from "@/store/authStore"

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading, logout } = useAuthStore()
  const [isClient, setIsClient] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient && !isLoading) {
      if (!isAuthenticated) {
        router.push("/login")
      } else if (user && user.role !== 'Agent') {
        router.push("/")
      }
    }
  }, [isClient, isLoading, isAuthenticated, user, router])

  if (!isClient || isLoading || !isAuthenticated || user?.role !== 'Agent') {
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
    return "A"
  }

  const navLinks = [
    { href: '/agent', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/agent/properties', label: 'My Properties', icon: Home },
    { href: '/agent/profile', label: 'Public Profile', icon: Settings },
  ]

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/" className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight">Urbaniq Agent</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-4">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || (link.href !== '/agent' && pathname.startsWith(link.href))
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  isActive 
                    ? "text-primary bg-primary/5 font-medium" 
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
      
      <div className="border-t p-4">
        <nav className="grid gap-1">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-red-500 hover:bg-red-500/10">
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </nav>
      </div>
    </>
  )


  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
          <aside className="relative w-64 flex-col bg-background h-full shadow-lg flex">
            <SidebarContent />
          </aside>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 text-muted-foreground hover:bg-muted rounded-md" 
              onClick={() => setMobileMenuOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
            <div className="font-semibold md:hidden">Urbaniq Agent</div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex-col text-right hidden sm:flex">
               <span className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</span>
               <span className="text-xs text-muted-foreground mt-1">Agent</span>
             </div>
             <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
               {getInitials()}
             </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
