"use client"

import * as React from "react"
import { Home } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

export function LandingToggle() {
  const router = useRouter()
  const pathname = usePathname()

  const handleToggle = () => {
    if (pathname?.startsWith('/dashboard')) {
      router.push('/landing')
    } else {
      router.push('/dashboard?tab=chat')
    }
  }

  const isDashboard = pathname?.startsWith('/dashboard')

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleToggle}
      className="h-9 w-9 bg-white/5 border border-white/10 hover:bg-white/10 text-white"
      title={isDashboard ? 'На главную' : 'В дашборд'}
    >
      <Home className="h-4 w-4" />
      <span className="sr-only">{isDashboard ? 'На главную' : 'В дашборд'}</span>
    </Button>
  )
}
