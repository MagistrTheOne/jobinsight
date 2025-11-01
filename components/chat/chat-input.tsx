"use client"

import { useState, useRef, useLayoutEffect, useCallback } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading?: boolean
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  isLoading = false,
  disabled = false,
  placeholder = "Напишите сообщение...",
}: ChatInputProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // auto-resize без лишних reflow
  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [message])

  const handleSubmit = useCallback(
    (e?: React.FormEvent | React.KeyboardEvent) => {
      e?.preventDefault()
      const text = message.trim()
      if (!text || isLoading || disabled) return

      onSend(text)
      setMessage("")

      if (textareaRef.current) textareaRef.current.style.height = "auto"
    },
    [message, onSend, isLoading, disabled],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-1.5">
      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading || disabled}
          rows={1}
          className={cn(
            "min-h-[52px] max-h-[200px] resize-none rounded-2xl px-4 py-3 pr-14 shadow-sm",
            "bg-white/10 border-white/20 text-white placeholder:text-neutral-400 backdrop-blur-md",
            "focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-white/30",
            "disabled:opacity-50",
          )}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || isLoading || disabled}
          className="h-[52px] w-[52px] shrink-0 rounded-xl bg-white/15 border border-white/20 text-white shadow-sm hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-md transition-all"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
      <p className="text-center text-[10px] text-neutral-500">
        Enter — отправить • Shift + Enter — новая строка
      </p>
    </form>
  )
}
