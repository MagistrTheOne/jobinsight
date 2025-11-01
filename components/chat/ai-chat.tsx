"use client"

import { useState, useEffect, useCallback } from "react"
import { ChatSidebar } from "./chat-sidebar"
import { ChatMessages } from "./chat-messages"
import { ChatInput } from "./chat-input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  createdAt?: Date | string
}

export function AIChat() {
  const [currentChatId, setCurrentChatId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('chatId');
    }
    return null;
  })
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [upgradeRequired, setUpgradeRequired] = useState(false)

  const loadChat = useCallback(async (chatId: string | null) => {
    if (!chatId) {
      setMessages([])
      setCurrentChatId(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/chat/history?chatId=${chatId}`)
      if (!res.ok) throw new Error("Не удалось загрузить чат")
      const data = await res.json()
      if (data.chat) {
        setMessages(data.chat.messages || [])
        setCurrentChatId(chatId)
      }
    } catch (e: any) {
      console.error(e)
      setError(e.message || "Ошибка загрузки чата")
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSendMessage = useCallback(
    async (message: string) => {
      setLoading(true)
      setError(null)
      setUpgradeRequired(false)
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId: currentChatId, message }),
        })
        const data = await res.json()

        if (!res.ok) {
          if (data.upgradeRequired) setUpgradeRequired(true)
          throw new Error(data.error || "Ошибка отправки сообщения")
        }

        setMessages(data.messages || [])
        if (data.newChat && data.chatId) {
          setCurrentChatId(data.chatId)
          window.dispatchEvent(new Event("chat-created"))
        }
        window.dispatchEvent(new Event("usage-refresh"))
      } catch (e: any) {
        setError(e.message || "Что-то пошло не так")
      } finally {
        setLoading(false)
      }
    },
    [currentChatId],
  )

  const handleSelectChat = useCallback(
    (chatId: string | null) => loadChat(chatId),
    [loadChat],
  )

  const handleDeleteChat = useCallback(
    (chatId: string) => {
      if (currentChatId === chatId) {
        setCurrentChatId(null)
        setMessages([])
      }
    },
    [currentChatId],
  )

  // --- Alerts as small composable UI ---
  const renderAlert = (type: "error" | "upgrade", msg: string) => {
    const isError = type === "error"
    const colors = isError
      ? "bg-red-950/30 border-red-800/30 text-red-300"
      : "bg-amber-950/30 border-amber-800/30 text-amber-300"
    return (
      <div className="absolute top-0 left-0 right-0 z-10 p-3 border-b border-white/5 bg-black/90 backdrop-blur-xl">
        <Alert variant={isError ? "destructive" : "default"} className={colors}>
          <AlertCircle className="h-3.5 w-3.5" />
          <AlertDescription className="text-xs">{msg}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Load chat from URL on mount - using ref to avoid dependency issues
  useEffect(() => {
    const initialChatId = currentChatId;
    if (initialChatId) {
      loadChat(initialChatId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleCreateNew = () => {
      setCurrentChatId(null);
      setMessages([]);
      setError(null);
    };

    window.addEventListener('chat-create-new', handleCreateNew);
    return () => window.removeEventListener('chat-create-new', handleCreateNew);
  }, []);

  return (
    <div className="flex h-full w-full max-w-full flex-col">
      {/* Chat Area - Full width, responsive */}
      <main className="relative flex h-full min-h-0 flex-1 flex-col bg-black w-full">
        {error && renderAlert("error", error)}
        {upgradeRequired &&
          renderAlert(
            "upgrade",
            "Достигнут лимит использования. Обновитесь до Pro для неограниченного доступа.",
          )}

        <div className="relative flex-1 overflow-hidden w-full">
          <ChatMessages messages={messages} isLoading={loading} />
        </div>

        <footer className="w-full border-t border-white/5 bg-black/90 backdrop-blur-2xl">
          <div className="mx-auto w-full max-w-4xl px-4 py-3">
            <ChatInput
              onSend={handleSendMessage}
              isLoading={loading}
              disabled={upgradeRequired}
            />
          </div>
        </footer>
      </main>
    </div>
  )
}
