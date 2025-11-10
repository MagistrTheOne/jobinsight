"use client"

import { useState, useRef, useLayoutEffect, useCallback } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Send, Loader2, Mic, MicOff, Paperclip, X, FileText, Image, File } from "lucide-react"
import { cn } from "@/lib/utils"

// типы web speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition
  new(): SpeechRecognition
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onstart: ((event: Event) => void) | null
  onend: ((event: Event) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface ChatInputProps {
  onSend: (message: string, files?: AttachedFile[]) => void
  isLoading?: boolean
  disabled?: boolean
  placeholder?: string
}

interface AttachedFile {
  file: File
  id: string
  type: "image" | "document" | "other"
}

export function ChatInput({
  onSend,
  isLoading = false,
  disabled = false,
  placeholder = "Напишите сообщение...",
}: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // авто-ресайз textarea
  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    const maxHeight = 120 // Максимальная высота в пикселях
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`
    // Добавляем overflow-y-auto если превышен максимум
    if (el.scrollHeight > maxHeight) {
      el.style.overflowY = "auto"
    } else {
      el.style.overflowY = "hidden"
    }
  }, [message])

  const handleSubmit = useCallback(
    (e?: React.FormEvent | React.KeyboardEvent) => {
      e?.preventDefault()
      const text = message.trim()
      if ((!text && attachedFiles.length === 0) || isLoading || disabled) return

      let fullMessage = text
      if (attachedFiles.length > 0) {
        const fileDescriptions = attachedFiles
          .map((f) => `[${f.type.toUpperCase()}] ${f.file.name}`)
          .join(", ")
        fullMessage = fullMessage
          ? `${fullMessage}\n\nПрикрепленные файлы: ${fileDescriptions}`
          : `Прикрепленные файлы: ${fileDescriptions}`
      }

      onSend(fullMessage, attachedFiles)
      setMessage("")
      setAttachedFiles([])
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
        textareaRef.current.style.overflowY = "hidden"
      }
    },
    [message, attachedFiles, onSend, isLoading, disabled]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const startRecording = useCallback(async () => {
    try {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognitionAPI) {
        setMessage((prev) => prev + " [Голосовой ввод не поддерживается]")
        return
      }

      const recognition = new SpeechRecognitionAPI()
      recognitionRef.current = recognition
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = "ru-RU"

      recognition.onstart = (event: Event) => setIsRecording(true)
      recognition.onend = (event: Event) => setIsRecording(false)
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
        if (event.error === 'not-allowed') {
          setMessage(prev => prev + " [Доступ к микрофону запрещен] ")
        } else {
          setMessage(prev => prev + " [Ошибка распознавания речи] ")
        }
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          }
        }
        if (finalTranscript) setMessage((prev) => prev + finalTranscript + " ")
      }

      recognition.start()
    } catch {
      setMessage((prev) => prev + " [Ошибка голосового ввода] ")
    }
  }, [])

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop()
    setIsRecording(false)
  }, [])

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles: AttachedFile[] = Array.from(files).map((file, i) => {
      let type: "image" | "document" | "other" = "other"
      if (file.type.startsWith("image/")) type = "image"
      else if (file.type.includes("pdf") || file.type.includes("text")) type = "document"

      return { file, id: `file-${Date.now()}-${i}`, type }
    })

    setAttachedFiles((prev) => [...prev, ...newFiles])
    e.target.value = ""
  }, [])

  const removeFile = useCallback((fileId: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }, [])

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-1 sm:space-y-1.5">
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachedFiles.map((attachedFile) => (
            <div
              key={attachedFile.id}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/15 text-white text-xs backdrop-blur-sm"
            >
              {attachedFile.type === "image" && <Image className="h-3 w-3" />}
              {attachedFile.type === "document" && <FileText className="h-3 w-3" />}
              {attachedFile.type === "other" && <File className="h-3 w-3" />}
              <span className="truncate max-w-[100px]">{attachedFile.file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(attachedFile.id)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-1.5 sm:gap-2">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleFileSelect}
            disabled={isLoading || disabled}
            className="h-[44px] w-[44px] sm:h-[52px] sm:w-[44px] rounded-lg sm:rounded-xl bg-white/5 border border-white/15 text-white hover:bg-white/10 disabled:opacity-50 backdrop-blur-sm transition-all"
            title="Прикрепить файл"
          >
            <Paperclip className="h-4 w-4 sm:h-5 sm:w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading || disabled}
            className={cn(
              "h-[44px] w-[44px] sm:h-[52px] sm:w-[44px] rounded-lg sm:rounded-xl border border-white/15 text-white backdrop-blur-sm transition-all",
              isRecording
                ? "bg-red-500/15 hover:bg-red-500/25 border-red-500/30 animate-pulse-glow"
                : "bg-white/5 hover:bg-white/10 disabled:opacity-50"
            )}
            title={isRecording ? "Остановить запись" : "Голосовой ввод"}
          >
            {isRecording ? <MicOff className="h-4 w-4 sm:h-5 sm:w-4" /> : <Mic className="h-4 w-4 sm:h-5 sm:w-4" />}
          </Button>
        </div>

        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading || disabled}
          rows={1}
          className={cn(
            "min-h-[44px] sm:min-h-[52px] max-h-[120px] resize-none rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 pr-11 sm:pr-14 shadow-sm flex-1",
            "bg-white/5 border-white/15 text-white placeholder:text-neutral-400 backdrop-blur-sm",
            "focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-white/20",
            "disabled:opacity-50 text-sm sm:text-base overflow-y-auto"
          )}
        />

        <Button
          type="submit"
          size="icon"
          disabled={(!message.trim() && attachedFiles.length === 0) || isLoading || disabled}
          className="h-[44px] w-[44px] sm:h-[52px] sm:w-[52px] shrink-0 rounded-lg sm:rounded-xl bg-white/10 border border-white/15 text-white shadow-sm hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm transition-all"
        >
          {isLoading ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> : <Send className="h-4 w-4 sm:h-5 sm:w-5" />}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt,.rtf"
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-center text-[9px] sm:text-[10px] text-neutral-500 px-2">
        Enter — отправить • Shift + Enter — новая строка • 🎤 Голос • 📎 Файлы
      </p>
    </form>
  )
}
