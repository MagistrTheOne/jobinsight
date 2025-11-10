"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Trash2, Plus, MessageSquare, Loader2, Edit3 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { chatStorage } from "@/lib/storage/chat-storage"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [chatToDelete, setChatToDelete] = useState<string | null>(null)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [chatToRename, setChatToRename] = useState<Chat | null>(null)
  const [newChatTitle, setNewChatTitle] = useState("")

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

  const handleRenameClick = useCallback(
    (chatId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      const chat = chats.find(c => c.id === chatId)
      if (!chat) return
      setChatToRename(chat)
      setNewChatTitle(chat.title)
      setRenameDialogOpen(true)
    },
    [chats]
  )

  const handleRenameConfirm = useCallback(async () => {
    if (!chatToRename || !newChatTitle.trim() || newChatTitle.trim() === chatToRename.title) {
      setRenameDialogOpen(false)
      setChatToRename(null)
      setNewChatTitle("")
      return
    }

    const chatId = chatToRename.id
    const trimmedTitle = newChatTitle.trim()
    setRenameDialogOpen(false)
    setChatToRename(null)
    setNewChatTitle("")

    try {
      const res = await fetch(`/api/chat/history/${chatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmedTitle }),
      })
      if (res.ok) {
        // Update in state and localStorage
        setChats((prev) => {
          const updated = prev.map(c =>
            c.id === chatId ? { ...c, title: trimmedTitle, updatedAt: new Date().toISOString() } : c
          )
          chatStorage.saveChats(updated)
          return updated
        })
        window.dispatchEvent(new CustomEvent("chat-updated", { detail: { chatId } }))
      }
    } catch (err) {
      // Silently handle error - user can retry
    }
  }, [chatToRename, newChatTitle])

  const handleDeleteClick = useCallback(
    (chatId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      setChatToDelete(chatId)
      setDeleteDialogOpen(true)
    },
    []
  )

  const handleDeleteConfirm = useCallback(async () => {
    if (!chatToDelete) return

    const chatId = chatToDelete
    setDeleteDialogOpen(false)
    setChatToDelete(null)

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
      // On error, reload chats to restore state
      fetchChats()
    }
  }, [chatToDelete, currentChatId, onDeleteChat, onSelectChat, fetchChats])

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

  // F2 key handler for renaming current chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2' && currentChatId) {
        e.preventDefault()
        const chat = chats.find(c => c.id === currentChatId)
        if (chat) {
          setChatToRename(chat)
          setNewChatTitle(chat.title)
          setRenameDialogOpen(true)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentChatId, chats])

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
              onDoubleClick={(e) => {
                e.stopPropagation()
                handleRenameClick(chat.id, e)
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
              onClick={(e) => handleRenameClick(chat.id, e)}
              className="flex h-6 w-6 items-center justify-center rounded text-neutral-500 opacity-0 transition-opacity hover:bg-white/10 hover:text-blue-400 group-hover:opacity-100"
              title="Переименовать (F2)"
            >
              <Edit3 className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => handleDeleteClick(chat.id, e)}
              className="flex h-6 w-6 items-center justify-center rounded text-neutral-500 opacity-0 transition-opacity hover:bg-white/10 hover:text-red-400 group-hover:opacity-100"
              title="Удалить чат"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    )
  }, [loading, error, chats, currentChatId, formatDate, handleDeleteClick, handleRenameClick, onSelectChat])

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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-black/95 backdrop-blur-xl border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Удалить чат?</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Это действие нельзя отменить. Чат будет удален навсегда.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setChatToDelete(null)
              }}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="bg-red-600/20 border-red-500/30 text-red-400 hover:bg-red-600/30"
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="bg-black/95 backdrop-blur-xl border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Переименовать чат</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Введите новое название для чата
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newChatTitle}
              onChange={(e) => setNewChatTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleRenameConfirm()
                }
                if (e.key === "Escape") {
                  setRenameDialogOpen(false)
                  setChatToRename(null)
                  setNewChatTitle("")
                }
              }}
              placeholder="Название чата"
              className="bg-white/5 border-white/10 text-white placeholder:text-neutral-400 focus-visible:ring-white/20"
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setRenameDialogOpen(false)
                setChatToRename(null)
                setNewChatTitle("")
              }}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              Отмена
            </Button>
            <Button
              onClick={handleRenameConfirm}
              disabled={!newChatTitle.trim() || (chatToRename ? newChatTitle.trim() === chatToRename.title : false)}
              className="bg-blue-600/20 border-blue-500/30 text-blue-400 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </GlassCard>
  )
}
