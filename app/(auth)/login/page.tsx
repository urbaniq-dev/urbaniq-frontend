"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await api.post("/auth/login", { email, password })
      const { token, ...user } = response.data
      setAuth(user, token)
      
      if (user.role === 'Buyer') {
        router.push('/dashboard/buyer')
      } else {
        router.push(`/dashboard/${user.role.toLowerCase()}`)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-left">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">
          Enter your credentials to access your dashboard.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleLogin}>
        {error && <div className="text-sm text-red-500 font-medium">{error}</div>}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            <Input id="email" type="email" placeholder="name@company.com" className="pl-10 bg-muted/50" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium leading-none" htmlFor="password">
              Password
            </label>
            <Link href="#" className="text-sm font-medium text-primary hover:underline">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <Input id="password" type="password" placeholder="••••••••" className="pl-10 bg-muted/50" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
        </div>
        <Button className="w-full h-12 text-base" disabled={loading}>
          {loading ? "Signing in..." : "Continue"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="h-12 bg-transparent" type="button">
          Google
        </Button>
        <Button variant="outline" className="h-12 bg-transparent" type="button">
          Apple
        </Button>
      </div>

      <p className="px-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Create Account
        </Link>
      </p>
    </div>
  )
}
