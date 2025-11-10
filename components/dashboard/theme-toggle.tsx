"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center gap-1">
        <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors">
          <Sun className="h-4 w-4" />
        </button>
        <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors">
          <Moon className="h-4 w-4" />
        </button>
      </div>
    )
  }

  const currentTheme = resolvedTheme || theme || 'light'
  const isDark = currentTheme === 'dark'

  const handleThemeChange = (newTheme: string) => {
    console.log('Switching theme from', currentTheme, 'to', newTheme)
    setTheme(newTheme)
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleThemeChange("light")}
        className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors ${
          !isDark
            ? 'bg-white/20 text-yellow-400'
            : 'hover:bg-white/10 text-neutral-400'
        }`}
        title="Светлая тема"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleThemeChange("dark")}
        className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors ${
          isDark
            ? 'bg-white/20 text-blue-400'
            : 'hover:bg-white/10 text-neutral-400'
        }`}
        title="Темная тема"
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  )
}
