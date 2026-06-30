"use client"

import { useState } from "react"
import Link from "next/link"
import { Building2, Menu, X, LogOut, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/authStore"
import { useRouter, usePathname } from "next/navigation"

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const getDashboardLink = () => {
    if (!user) return '/login'
    if (user.role === 'Agent') return '/agent'
    return `/dashboard/${user.role.toLowerCase()}`
  }

  if (pathname === '/') {
    return null;
  }

  const navLinks = [
    { href: '/properties', label: 'Properties' },
    { href: '/agent', label: 'For Agents' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-8 mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl inline-block tracking-tight">Urbaniq</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname.startsWith(link.href) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated && user ? (
            <>
              <Link href={getDashboardLink()} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <div className="flex items-center gap-3 pl-4 border-l border-border">
                <Link href={user.role === 'Agent' ? '/agent/profile' : '/profile'} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="text-right">
                    <p className="text-sm font-semibold leading-none">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{user.role}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm overflow-hidden border border-primary/20">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`
                    )}
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
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

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md text-muted-foreground hover:bg-muted"
          onClick={() => setMobileOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 py-4 flex flex-col gap-3">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary py-1"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t pt-3 mt-1 flex flex-col gap-3">
            {isAuthenticated && user ? (
              <>
                <Link href={getDashboardLink()} className="text-sm font-medium" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="text-sm font-medium text-destructive text-left">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
                <Button asChild size="sm" onClick={() => setMobileOpen(false)}>
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
