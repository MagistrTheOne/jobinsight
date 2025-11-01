"use client"

import { useEffect, useRef, useState, memo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Copy, Check, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useAuthStore } from "@/store/auth-store"
import { GlassCard } from "@/components/ui/glass-card"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  createdAt?: Date | string
}

interface ChatMessagesProps {
  messages: Message[]
  isLoading?: boolean
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { user } = useAuthStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length, isLoading])

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (e) {
      console.error("copy error", e)
    }
  }

  const displayMessages = messages.filter((m) => m.role !== "system")
  const userName = user?.name || user?.email?.split("@")[0] || "User"

  if (displayMessages.length === 0) {
    return (
      <ScrollArea className="h-full w-full">
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
          <div className="mb-5 rounded-full bg-white/5 border border-white/10 p-3 backdrop-blur-sm">
            <Bot className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
            Начните разговор с AI Hunter
          </h3>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-lg">
            Я помогу вам составить резюме, подготовиться к собеседованию или найти подходящие вакансии
          </p>
        </div>
      </ScrollArea>
    )
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="mx-auto max-w-4xl px-4 py-4 sm:py-6">
        <div className="space-y-4 sm:space-y-6">
          {displayMessages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              userName={userName}
              userImage={user?.image}
              copiedId={copiedId}
              onCopy={handleCopy}
            />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </ScrollArea>
  )
}

/* --- вспомогательные куски --- */

const MessageBubble = memo(
  ({
    message,
    userName,
    userImage,
    copiedId,
    onCopy,
  }: {
    message: Message
    userName: string
    userImage?: string
    copiedId: string | null
    onCopy: (content: string, id: string) => void
  }) => {
    const isUser = message.role === "user"
    return (
      <div
        className={cn(
          "group flex gap-2.5",
          isUser ? "justify-end" : "justify-start",
        )}
      >
        {!isUser && (
          <Avatar className="h-7 w-7 shrink-0 border border-white/10">
            <AvatarFallback className="bg-white/10 text-white backdrop-blur-sm">
              <Bot className="h-3.5 w-3.5" />
            </AvatarFallback>
          </Avatar>
        )}

        <div
          className={cn(
            "flex max-w-[90%] flex-col md:max-w-[80%]",
            isUser ? "items-end" : "items-start",
          )}
        >
          <div
            className={cn(
              "mb-1 px-2 text-[10px] font-medium",
              isUser ? "text-neutral-500" : "text-neutral-500",
            )}
          >
            {isUser ? userName : "AI Hunter"}
          </div>

          {isUser ? (
            <div className="relative rounded-lg bg-white/10 border border-white/10 px-3.5 py-2.5 text-white shadow-sm backdrop-blur-sm">
              <div className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed">
                {message.content}
              </div>
            </div>
          ) : (
            <div className="relative rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 shadow-sm backdrop-blur-sm">
              <MarkdownContent>{message.content}</MarkdownContent>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute -top-1 -right-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100",
                  "text-neutral-500 hover:text-white hover:bg-white/10",
                )}
                onClick={() => onCopy(message.content, message.id)}
              >
                {copiedId === message.id ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          )}
        </div>

        {isUser && (
          <Avatar className="h-7 w-7 shrink-0 border border-white/10">
            {userImage && <AvatarImage src={userImage} alt={userName} />}
            <AvatarFallback className="bg-white/10 text-white backdrop-blur-sm">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    )
  },
)
MessageBubble.displayName = "MessageBubble"

const MarkdownContent = memo(({ children }: { children: string }) => (
  <div className="prose prose-invert prose-sm max-w-none wrap-break-word text-white">
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
  </div>
))
MarkdownContent.displayName = "MarkdownContent"

const TypingIndicator = () => (
  <div className="mt-4 flex justify-start gap-2.5">
    <Avatar className="h-7 w-7 shrink-0 border border-white/10">
      <AvatarFallback className="bg-white/10 text-white backdrop-blur-sm">
        <Bot className="h-3.5 w-3.5" />
      </AvatarFallback>
    </Avatar>
    <div className="flex flex-col items-start">
      <div className="mb-1 px-2 text-[10px] font-medium text-neutral-500">
        AI Hunter
      </div>
      <div className="rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 backdrop-blur-sm">
        <div className="flex gap-1.5">
          {[0, 150, 300].map((d) => (
            <div
              key={d}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60"
              style={{ animationDelay: `${d}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
)
