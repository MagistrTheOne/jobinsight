"use client";

import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Copy, Check, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date | string;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleCopy = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Filter out system messages for display
  const displayMessages = messages.filter(msg => msg.role !== 'system');

  return (
    <ScrollArea className="flex-1 h-full">
      <div className="p-4 space-y-4">
        {displayMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <Bot className="h-12 w-12 text-neutral-600 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-300 mb-2">
              Начните разговор
            </h3>
            <p className="text-sm text-neutral-500 max-w-md">
              Я помогу вам составить резюме, подготовиться к собеседованию или найти подходящие вакансии
            </p>
          </div>
        ) : (
          displayMessages.map((message) => {
            const isUser = message.role === 'user';
            
            return (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  isUser ? "justify-end" : "justify-start"
                )}
              >
                {!isUser && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-blue-600 text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2.5",
                    isUser
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-800/80 text-neutral-200 border border-neutral-700/50"
                  )}
                >
                  <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                    {message.content}
                  </div>
                  
                  {!isUser && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 mt-2 text-neutral-400 hover:text-neutral-200"
                      onClick={() => handleCopy(message.content, message.id)}
                    >
                      {copiedId === message.id ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  )}
                </div>

                {isUser && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-neutral-700 text-white">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-blue-600 text-white">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-neutral-800/80 rounded-lg px-4 py-2.5 border border-neutral-700/50">
              <div className="flex gap-1">
                <div className="h-2 w-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}

