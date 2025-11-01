"use client";

import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Copy, Check, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuthStore } from '@/store/auth-store';
import { GlassCard } from '@/components/ui/glass-card';

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
  const { user } = useAuthStore();

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

  // Get user display name
  const userName = user?.name || user?.email?.split('@')[0] || 'User';

  return (
    <ScrollArea className="flex-1 h-full">
      <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
        {displayMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 mb-4">
              <Bot className="h-12 w-12 text-blue-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-neutral-300 mb-2">
              Начните разговор с AI Hunter
            </h3>
            <p className="text-sm sm:text-base text-neutral-500 max-w-md">
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
                  "flex gap-2 sm:gap-3 group",
                  isUser ? "justify-end" : "justify-start"
                )}
              >
                {/* Avatar - Left for AI, Right for User */}
                {!isUser && (
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                      <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}

                {/* Message Content */}
                <div className={cn(
                  "flex flex-col max-w-[85%] sm:max-w-[75%] md:max-w-[70%]",
                  isUser ? "items-end" : "items-start"
                )}>
                  {/* Name Label */}
                  <div className={cn(
                    "text-xs sm:text-sm font-medium mb-1.5 px-2",
                    isUser ? "text-neutral-400" : "text-blue-400"
                  )}>
                    {isUser ? userName : "AI Hunter"}
                  </div>

                  {/* Message Bubble */}
                  {isUser ? (
                    // User message with glass morphism
                    <GlassCard className={cn(
                      "rounded-2xl px-4 sm:px-5 py-3 sm:py-4",
                      "bg-gradient-to-br from-blue-600/30 to-purple-600/30",
                      "backdrop-blur-xl border border-blue-500/30",
                      "shadow-lg shadow-blue-500/10"
                    )}>
                      <div className="text-sm sm:text-base text-white leading-relaxed whitespace-pre-wrap break-words">
                        {message.content}
                      </div>
                    </GlassCard>
                  ) : (
                    // AI message with markdown support
                    <div className={cn(
                      "rounded-2xl px-4 sm:px-5 py-3 sm:py-4",
                      "bg-neutral-900/80 backdrop-blur-sm",
                      "border border-neutral-800/50",
                      "shadow-lg"
                    )}>
                      <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Headings
                            h1: ({node, ...props}) => <h1 className="text-xl sm:text-2xl font-bold text-white mt-4 mb-2 first:mt-0" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-lg sm:text-xl font-bold text-white mt-3 mb-2 first:mt-0" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-base sm:text-lg font-semibold text-white mt-3 mb-2 first:mt-0" {...props} />,
                            // Paragraphs
                            p: ({node, ...props}) => <p className="text-neutral-200 leading-relaxed mb-3 last:mb-0" {...props} />,
                            // Bold
                            strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                            // Italic
                            em: ({node, ...props}) => <em className="italic text-neutral-300" {...props} />,
                            // Links
                            a: ({node, ...props}) => <a className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer" {...props} />,
                            // Lists
                            ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 my-3 text-neutral-200" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-1 my-3 text-neutral-200" {...props} />,
                            li: ({node, ...props}) => <li className="text-neutral-200" {...props} />,
                            // Code blocks
                            code: ({node, inline, ...props}: any) => {
                              if (inline) {
                                return <code className="bg-neutral-800/50 px-1.5 py-0.5 rounded text-sm font-mono text-purple-300" {...props} />;
                              }
                              return <code className="block bg-neutral-950 p-3 rounded-lg overflow-x-auto text-sm font-mono text-neutral-300 my-3 border border-neutral-800" {...props} />;
                            },
                            pre: ({node, ...props}) => <pre className="bg-neutral-950 p-3 rounded-lg overflow-x-auto my-3 border border-neutral-800" {...props} />,
                            // Blockquotes
                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500 pl-4 my-3 italic text-neutral-300" {...props} />,
                            // Horizontal rule
                            hr: ({node, ...props}) => <hr className="my-4 border-neutral-800" {...props} />,
                            // Tables
                            table: ({node, ...props}) => <table className="w-full border-collapse my-3 text-sm" {...props} />,
                            thead: ({node, ...props}) => <thead className="bg-neutral-800/50" {...props} />,
                            tbody: ({node, ...props}) => <tbody {...props} />,
                            tr: ({node, ...props}) => <tr className="border-b border-neutral-800" {...props} />,
                            th: ({node, ...props}) => <th className="px-4 py-2 text-left font-semibold text-white" {...props} />,
                            td: ({node, ...props}) => <td className="px-4 py-2 text-neutral-300" {...props} />,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      
                      {/* Copy Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 mt-3 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleCopy(message.content, message.id)}
                      >
                        {copiedId === message.id ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Avatar - Right for User */}
                {isUser && (
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
                    {user?.image ? (
                      <AvatarImage src={user.image} alt={userName} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-2 sm:gap-3 justify-start group">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <div className="text-xs sm:text-sm font-medium mb-1.5 px-2 text-blue-400">
                AI Hunter
              </div>
              <div className="bg-neutral-900/80 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 border border-neutral-800/50">
                <div className="flex gap-1.5">
                  <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
