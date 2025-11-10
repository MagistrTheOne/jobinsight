"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="theme-toggle">
        <button className="theme-toggle-button">
          <Sun />
        </button>
        <button className="theme-toggle-button">
          <Moon />
        </button>
      </div>
    )
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <div className="theme-toggle">
      <button
        onClick={() => setTheme("light")}
        className={`theme-toggle-button ${!isDark ? 'active' : ''}`}
        title="Светлая тема"
      >
        <Sun />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`theme-toggle-button ${isDark ? 'active' : ''}`}
        title="Темная тема"
      >
        <Moon />
      </button>
    </div>
  )
}
