import Link from "next/link"
import { Logo } from "@/components/ui/Logo"

export function Footer() {
  return (
    <footer className="border-t py-12 bg-muted/40">
      <div className="container px-4 sm:px-8 max-w-screen-2xl mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
        <div className="flex flex-col gap-2">
          <div className="mb-4">
            <Logo height={40} asLink={false} />
          </div>
          <p className="text-sm text-muted-foreground">
            Premium real estate management platform for modern property transactions.
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Platform</h3>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            <li><Link href="/properties" className="hover:text-primary">Search Properties</Link></li>
            <li><Link href="/dashboard/owner" className="hover:text-primary">List a Property</Link></li>
            <li><Link href="/dashboard/agent" className="hover:text-primary">Agent Portal</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Company</h3>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            <li><Link href="#" className="hover:text-primary">About Us</Link></li>
            <li><Link href="#" className="hover:text-primary">Careers</Link></li>
            <li><Link href="#" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Legal</h3>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            <li><Link href="#" className="hover:text-primary">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-primary">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="container max-w-screen-2xl mx-auto px-4 sm:px-8 mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Urbaniq. All rights reserved.
      </div>
    </footer>
  )
}
