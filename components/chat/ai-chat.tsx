"use client";

import { useState, useEffect, useCallback } from 'react';
import { ChatSidebar } from './chat-sidebar';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date | string;
}

export function AIChat() {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgradeRequired, setUpgradeRequired] = useState(false);

  const loadChat = useCallback(async (chatId: string | null) => {
    if (!chatId) {
      setMessages([]);
      setCurrentChatId(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/chat/history?chatId=${chatId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.chat) {
          setMessages(data.chat.messages || []);
          setCurrentChatId(chatId);
        }
      } else {
        setError('Failed to load chat');
      }
    } catch (err) {
      console.error('Failed to load chat:', err);
      setError('Failed to load chat');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSendMessage = async (message: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setUpgradeRequired(false);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: currentChatId,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.upgradeRequired) {
          setUpgradeRequired(true);
        }
        throw new Error(data.error || 'Failed to send message');
      }

      // Update messages with new conversation
      setMessages(data.messages || []);
      
      // If new chat was created, update currentChatId
      if (data.newChat && data.chatId) {
        setCurrentChatId(data.chatId);
        // Refresh sidebar to show new chat
        window.dispatchEvent(new Event('chat-created'));
      }

      // Refresh usage limits
      window.dispatchEvent(new Event('usage-refresh'));

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChat = (chatId: string | null) => {
    loadChat(chatId);
  };

  const handleDeleteChat = (chatId: string) => {
    if (currentChatId === chatId) {
      setCurrentChatId(null);
      setMessages([]);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full max-w-full">
      {/* Chat History Sidebar */}
      <div className="hidden lg:block w-64 shrink-0 border-r border-neutral-800/50">
        <ChatSidebar
          currentChatId={currentChatId || undefined}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
        />
      </div>

      {/* Main Chat Area - ChatGPT-like layout */}
      <div className="flex-1 flex flex-col h-full min-h-0 bg-black relative">
        {/* Error Display */}
        {error && (
          <div className="absolute top-0 left-0 right-0 z-10 p-4 border-b border-neutral-800/50 bg-black/90 backdrop-blur-sm">
            <Alert variant="destructive" className="bg-red-950/50 border-red-800/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {upgradeRequired && (
          <div className="absolute top-0 left-0 right-0 z-10 p-4 border-b border-neutral-800/50 bg-black/90 backdrop-blur-sm">
            <Alert className="bg-amber-950/50 border-amber-800/50">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <AlertDescription className="text-amber-300">
                Достигнут лимит использования. Обновитесь до Pro для неограниченного доступа.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Messages - Centered like ChatGPT */}
        <div className="flex-1 overflow-hidden relative">
          <ChatMessages messages={messages} isLoading={isLoading} />
        </div>

        {/* Input - Fixed at bottom */}
        <div className="w-full border-t border-neutral-800/50 bg-black/95 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl px-4 py-4">
            <ChatInput
              onSend={handleSendMessage}
              isLoading={isLoading}
              disabled={upgradeRequired}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

