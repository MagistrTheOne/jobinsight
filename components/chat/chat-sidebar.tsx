"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Trash2, Plus, MessageSquare, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { chatStorage } from "@/lib/storage/chat-storage"

interface Chat {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

interface ChatSidebarProps {
  currentChatId?: string
  onSelectChat: (chatId: string | null) => void
  onDeleteChat?: (chatId: string) => void
}

export function ChatSidebar({
  currentChatId,
  onSelectChat,
  onDeleteChat,
}: ChatSidebarProps) {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Load from localStorage first for instant display
      const cachedChats = chatStorage.getChats()
      if (cachedChats.length > 0) {
        setChats(cachedChats)
      }

      // Then fetch from API and sync
      const res = await fetch("/api/chat/history")
      if (!res.ok) throw new Error("failed")
      const data = await res.json()
      const apiChats = data.chats || []
      setChats(apiChats)
      
      // Save to localStorage
      chatStorage.saveChats(apiChats)
    } catch {
      // On error, use cached data if available
      const cachedChats = chatStorage.getChats()
      if (cachedChats.length > 0) {
        setChats(cachedChats)
        setError("Используются сохраненные чаты (офлайн)")
      } else {
        setError("Не удалось загрузить чаты")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChats()
    const refresh = () => fetchChats()
    window.addEventListener("chat-created", refresh)
    return () => window.removeEventListener("chat-created", refresh)
  }, [fetchChats])

  const handleDelete = useCallback(
    async (chatId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      if (!confirm("Удалить этот чат?")) return
      try {
        // Optimistic update: remove from UI and localStorage immediately
        setChats((prev) => {
          const filtered = prev.filter((c) => c.id !== chatId)
          chatStorage.saveChats(filtered)
          return filtered
        })
        chatStorage.deleteChat(chatId)
        
        if (onDeleteChat) onDeleteChat(chatId)
        if (currentChatId === chatId) {
          onSelectChat(null)
          chatStorage.saveCurrentChatId(null)
        }

        // Then delete from API
        const res = await fetch(`/api/chat/history/${chatId}`, {
          method: "DELETE",
        })
        if (!res.ok) throw new Error("delete fail")
      } catch (err) {
        console.error(err)
        // On error, reload chats to restore state
        fetchChats()
      }
    },
    [currentChatId, onDeleteChat, onSelectChat, fetchChats],
  )

  const formatDate = useCallback((date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date
    const diff = Date.now() - d.getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return "Только что"
    if (mins < 60) return `${mins} мин назад`
    if (hours < 24) return `${hours} ч назад`
    if (days < 7) return `${days} дн назад`
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
  }, [])

  const content = useMemo(() => {
    if (loading)
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
        </div>
      )

    if (error)
      return (
        <div className="py-8 text-center text-xs text-neutral-500">{error}</div>
      )

    if (chats.length === 0)
      return (
        <div className="py-8 text-center text-xs text-neutral-500">
          <MessageSquare className="mx-auto mb-2 h-6 w-6 opacity-50" />
          <p>Нет сохраненных чатов</p>
          <p className="mt-1 text-[10px]">Начните новый чат</p>
        </div>
      )

    return (
      <div className="space-y-0.5 px-2">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={cn(
              "group flex w-full items-center justify-between rounded-md p-2 transition-colors",
              currentChatId === chat.id
                ? "bg-white/10 border border-white/10"
                : "hover:bg-white/5 border border-transparent",
            )}
          >
            <button
              onClick={() => onSelectChat(chat.id)}
              className="min-w-0 flex-1 pr-2 text-left"
              onDoubleClick={async (e) => {
                e.stopPropagation()
                const newTitle = prompt("Новое название чата:", chat.title)
                if (newTitle && newTitle.trim() && newTitle !== chat.title) {
                  try {
                    const res = await fetch(`/api/chat/history/${chat.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ title: newTitle.trim() }),
                    })
                    if (res.ok) {
                      // Update in state and localStorage
                      setChats((prev) => {
                        const updated = prev.map(c => 
                          c.id === chat.id ? { ...c, title: newTitle.trim(), updatedAt: new Date().toISOString() } : c
                        )
                        chatStorage.saveChats(updated)
                        return updated
                      })
                    }
                  } catch (err) {
                    console.error("Failed to update chat title:", err)
                  }
                }
              }}
            >
              <div className="truncate text-xs font-medium text-white">
                {chat.title}
              </div>
              <div className="mt-0.5 text-[10px] text-neutral-500">
                {formatDate(chat.updatedAt)}
              </div>
            </button>
            <button
              onClick={(e) => handleDelete(chat.id, e)}
              className="flex h-6 w-6 items-center justify-center rounded text-neutral-500 opacity-0 transition-opacity hover:bg-white/10 hover:text-red-400 group-hover:opacity-100"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    )
  }, [loading, error, chats, currentChatId, formatDate, handleDelete, onSelectChat])

  return (
    <GlassCard className="flex h-full flex-col border border-white/5 bg-black/60 backdrop-blur-2xl">
      <div className="border-b border-white/5 p-2.5">
        <Button
          onClick={() => onSelectChat(null)}
          size="sm"
          className="w-full bg-white/5 border border-white/10 text-white hover:bg-white/10 text-xs h-8"
        >
          <Plus className="mr-2 h-4 w-4" />
          Новый чат
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">{content}</div>
      </ScrollArea>
    </GlassCard>
  )
}
