"use client"

import Link from "next/link"
import { UserCircle, LogOut, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/ui/Logo"

export function Navbar() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const getDashboardPath = () => {
    if (!user) return '/login'
    return `/dashboard/${user.role.toLowerCase()}`
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-8 mx-auto">
        <div className="flex items-center gap-2">
          <Logo height={44} />
          {/* Show marketing links only for unauthenticated users */}
          {!user && (
            <nav className="hidden md:flex gap-6 ml-6">
              <Link
                href="/properties"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Properties
              </Link>
              <Link
                href="/register?role=agent"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                For Agents
              </Link>
              <Link
                href="/register?role=owner"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                For Owners
              </Link>
            </nav>
          )}
          {/* Show contextual links for authenticated users */}
          {user && (
            <nav className="hidden md:flex gap-6 ml-6">
              <Link
                href="/properties"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Browse Properties
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <UserCircle className="h-5 w-5" />
                <span className="font-medium">{user.firstName}</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">{user.role}</span>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={getDashboardPath()}>
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
                Sign In
              </Link>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
