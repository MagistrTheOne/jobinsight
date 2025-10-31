"use client";

import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Trash2, Plus, MessageSquare, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Chat {
  id: string;
  title: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface ChatSidebarProps {
  currentChatId?: string;
  onSelectChat: (chatId: string | null) => void;
  onDeleteChat?: (chatId: string) => void;
}

export function ChatSidebar({ currentChatId, onSelectChat, onDeleteChat }: ChatSidebarProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/chat/history');
      if (response.ok) {
        const data = await response.json();
        setChats(data.chats || []);
      } else {
        setError('Failed to load chats');
      }
    } catch (err) {
      console.error('Failed to fetch chats:', err);
      setError('Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
    
    // Listen for new chat creation to refresh list
    const handleChatCreated = () => fetchChats();
    window.addEventListener('chat-created', handleChatCreated);
    
    return () => {
      window.removeEventListener('chat-created', handleChatCreated);
    };
  }, []);

  const handleDelete = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Удалить этот чат?')) return;

    try {
      const response = await fetch(`/api/chat/history/${chatId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setChats(chats.filter(chat => chat.id !== chatId));
        if (onDeleteChat) {
          onDeleteChat(chatId);
        }
        if (currentChatId === chatId) {
          onSelectChat(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} дн назад`;
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <GlassCard className="h-full flex flex-col bg-neutral-950/60 backdrop-blur-sm border border-neutral-800/50">
      <div className="p-3 border-b border-neutral-800/50">
        <Button
          onClick={() => onSelectChat(null)}
          className="w-full bg-neutral-800 hover:bg-neutral-700 text-white"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Новый чат
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-sm text-neutral-500">
              {error}
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-8 text-sm text-neutral-500">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Нет сохраненных чатов</p>
              <p className="text-xs mt-1">Начните новый чат</p>
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors group",
                    currentChatId === chat.id
                      ? "bg-neutral-800/80 text-white"
                      : "hover:bg-neutral-900/50 text-neutral-300"
                  )}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="text-sm font-medium truncate">
                      {chat.title}
                    </div>
                    <div className="text-xs text-neutral-500 mt-0.5">
                      {formatDate(chat.updatedAt)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-red-400"
                    onClick={(e) => handleDelete(chat.id, e)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </GlassCard>
  );
}

