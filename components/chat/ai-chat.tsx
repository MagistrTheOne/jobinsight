"use client"

import { useState, useEffect, useCallback } from "react"
import { ChatSidebar } from "./chat-sidebar"
import { ChatMessages } from "./chat-messages"
import { ChatInput } from "./chat-input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { chatStorage } from "@/lib/storage/chat-storage"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  createdAt?: Date | string
  actionMetadata?: {
    actionType: string
    metadata?: {
      title?: string
      downloadUrl?: string
      [key: string]: any
    }
  }
}

export function AIChat() {
  const [currentChatId, setCurrentChatId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const urlChatId = params.get("chatId")
      const storedChatId = chatStorage.getCurrentChatId()
      return urlChatId || storedChatId
    }
    return null
  })
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [upgradeRequired, setUpgradeRequired] = useState(false)

  const loadChat = useCallback(async (chatId: string | null) => {
    if (!chatId) {
      setMessages([])
      setCurrentChatId(null)
      chatStorage.saveCurrentChatId(null)
      return
    }

    setLoading(true)
    setError(null)

    const cachedChat = chatStorage.getChat(chatId)
    if (cachedChat?.messages) {
      setMessages(cachedChat.messages)
      setCurrentChatId(chatId)
      chatStorage.saveCurrentChatId(chatId)
    }

    try {
      const res = await fetch(`/api/chat/history/${chatId}`)
      if (!res.ok) throw new Error("Не удалось загрузить чат")
      const data = await res.json()
      if (data.chat) {
        setMessages(data.chat.messages || [])
        setCurrentChatId(chatId)
        chatStorage.saveCurrentChatId(chatId)
        chatStorage.saveChat(data.chat)
      }
    } catch (e: any) {
      console.error(e)
      if (cachedChat?.messages) {
        setError("Используются сохраненные сообщения (офлайн)")
      } else {
        setError(e.message || "Ошибка загрузки чата")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSendMessage = useCallback(
    async (message: string, files?: { file: File; id: string; type: string }[]) => {
      const tempUserMessageId = `temp-${Date.now()}-${Math.random()}`
      const optimisticUserMessage: Message = {
        id: tempUserMessageId,
        role: "user",
        content: message,
        createdAt: new Date(),
      }

      setMessages((prev) => [...prev, optimisticUserMessage])
      setLoading(true)
      setError(null)
      setUpgradeRequired(false)

      try {
        const formData = new FormData()
        formData.append("chatId", currentChatId || "")
        formData.append("message", message)

        if (files && files.length > 0) {
          files.forEach((file, index) => {
            formData.append(`file_${index}`, file.file)
            formData.append(`file_${index}_type`, file.type)
          })
        }

        const res = await fetch("/api/chat", {
          method: "POST",
          body: formData,
        })

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("API endpoint не найден. Проверьте, что сервер запущен.")
          }
        }

        const data = await res.json()

        if (!res.ok) {
          setMessages((prev) => prev.filter((m) => m.id !== tempUserMessageId))
          if (data.upgradeRequired) setUpgradeRequired(true)
          throw new Error(data.error || "Ошибка отправки сообщения")
        }

        const updatedMessages = data.messages || []
        if (data.actionMetadata && updatedMessages.length > 0) {
          const lastMessage = updatedMessages[updatedMessages.length - 1]
          if (lastMessage.role === "assistant") {
            lastMessage.actionMetadata = data.actionMetadata
          }
        }
        setMessages(updatedMessages)

        if (data.newChat && data.chatId) {
          setCurrentChatId(data.chatId)
          chatStorage.saveCurrentChatId(data.chatId)

          const newUrl = new URL(window.location.href)
          newUrl.searchParams.set("chatId", data.chatId)
          window.history.pushState({}, "", newUrl.toString())

          if (data.chatTitle) {
            chatStorage.saveChat({
              id: data.chatId,
              title: data.chatTitle,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              messages: data.messages || [],
            })
          }

          window.dispatchEvent(new Event("chat-created"))
        } else if (data.chatId) {
          setCurrentChatId(data.chatId)
          chatStorage.saveCurrentChatId(data.chatId)
          if (data.chatId !== currentChatId) {
            const newUrl = new URL(window.location.href)
            newUrl.searchParams.set("chatId", data.chatId)
            window.history.pushState({}, "", newUrl.toString())
            window.dispatchEvent(new CustomEvent("chat-updated", { detail: { chatId: data.chatId } }))
          }

          const existingChat = chatStorage.getChat(data.chatId)
          if (existingChat) {
            chatStorage.saveChat({
              ...existingChat,
              messages: data.messages || [],
              updatedAt: new Date().toISOString(),
            })
          }
        }
        window.dispatchEvent(new Event("usage-refresh"))
      } catch (e: any) {
        setError(e.message || "Что-то пошло не так")
      } finally {
        setLoading(false)
      }
    },
    [currentChatId]
  )

  const handleSelectChat = useCallback((chatId: string | null) => loadChat(chatId), [loadChat])

  const handleDeleteChat = useCallback(
    (chatId: string) => {
      if (currentChatId === chatId) {
        setCurrentChatId(null)
        setMessages([])
      }
    },
    [currentChatId]
  )

  const renderAlert = (type: "error" | "upgrade", msg: string) => {
    const isError = type === "error"
    const colors = isError
      ? "bg-red-950/30 border-red-800/30 text-red-300"
      : "bg-amber-950/30 border-amber-800/30 text-amber-300"
    return (
      <div className="absolute top-0 left-0 right-0 z-10 p-3 border-b border-white/5 bg-black/80 backdrop-blur-lg">
        <Alert variant={isError ? "destructive" : "default"} className={colors}>
          <AlertCircle className="h-3.5 w-3.5" />
          <AlertDescription className="text-xs">{msg}</AlertDescription>
        </Alert>
      </div>
    )
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlChatId = params.get("chatId")

    if (urlChatId && urlChatId !== currentChatId) {
      setCurrentChatId(urlChatId)
      loadChat(urlChatId)
    }

    const handleChatSelected = (e: CustomEvent<{ chatId: string }>) => {
      const chatId = e.detail.chatId
      if (chatId && chatId !== currentChatId) {
        setCurrentChatId(chatId)
        loadChat(chatId)
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.set("chatId", chatId)
        window.history.pushState({}, "", newUrl.toString())
      }
    }

    window.addEventListener("chat-selected", handleChatSelected as EventListener)

    return () => {
      window.removeEventListener("chat-selected", handleChatSelected as EventListener)
    }
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      const urlChatId = params.get("chatId")
      if (urlChatId && urlChatId !== currentChatId) {
        setCurrentChatId(urlChatId)
        loadChat(urlChatId)
      } else if (!urlChatId && currentChatId) {
        setCurrentChatId(null)
        setMessages([])
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [currentChatId, loadChat])

  useEffect(() => {
    const handleCreateNew = () => {
      setCurrentChatId(null)
      setMessages([])
      setError(null)
      setUpgradeRequired(false)
      if (typeof window !== "undefined") {
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete("chatId")
        window.history.pushState({}, "", newUrl.toString())
      }
    }

    window.addEventListener("chat-create-new", handleCreateNew)
    return () => window.removeEventListener("chat-create-new", handleCreateNew)
  }, [])

  return (
    <div className="flex h-full w-full max-w-full">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-0 h-full w-full max-w-full min-h-0">
        {/* Sidebar */}
        <div className="hidden lg:block border-r border-white/5 bg-black/75 backdrop-blur-lg">
          <ChatSidebar
            currentChatId={currentChatId || undefined}
            onSelectChat={handleSelectChat}
            onDeleteChat={handleDeleteChat}
          />
        </div>

        {/* Main Chat */}
        <div className="flex flex-col h-full min-h-0 bg-black">
          {error && renderAlert("error", error)}
          {upgradeRequired &&
            renderAlert("upgrade", "Достигнут лимит использования. Обновитесь до Pro для неограниченного доступа.")}

          <div className="flex-1 min-h-0 overflow-hidden relative">
            <ChatMessages messages={messages} isLoading={loading} />
          </div>

          <div className="shrink-0 border-t border-white/5 bg-black/85 backdrop-blur-lg">
            <div className="mx-auto w-full max-w-4xl px-4 py-3">
              <ChatInput onSend={handleSendMessage} isLoading={loading} disabled={upgradeRequired} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
