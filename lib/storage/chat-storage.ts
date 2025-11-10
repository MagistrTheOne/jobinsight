interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt: string;
  }>;
}

const STORAGE_KEY = 'jobinsight_chats';
const CURRENT_CHAT_KEY = 'jobinsight_current_chat_id';

export const chatStorage = {
  // Save chats to localStorage
  saveChats: (chats: Chat[]): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch (error) {
      console.error('Failed to save chats to localStorage:', error);
    }
  },

  // Get chats from localStorage
  getChats: (): Chat[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to read chats from localStorage:', error);
      return [];
    }
  },

  // Save single chat
  saveChat: (chat: Chat): void => {
    if (typeof window === 'undefined') return;
    try {
      const chats = chatStorage.getChats();
      const index = chats.findIndex(c => c.id === chat.id);
      if (index >= 0) {
        chats[index] = chat;
      } else {
        chats.push(chat);
      }
      // Sort by updatedAt descending
      chats.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      chatStorage.saveChats(chats);
    } catch (error) {
      console.error('Failed to save chat to localStorage:', error);
    }
  },

  // Get single chat by ID
  getChat: (chatId: string): Chat | null => {
    if (typeof window === 'undefined') return null;
    try {
      const chats = chatStorage.getChats();
      return chats.find(c => c.id === chatId) || null;
    } catch (error) {
      console.error('Failed to get chat from localStorage:', error);
      return null;
    }
  },

  // Delete chat from localStorage
  deleteChat: (chatId: string): void => {
    if (typeof window === 'undefined') return;
    try {
      const chats = chatStorage.getChats();
      const filtered = chats.filter(c => c.id !== chatId);
      chatStorage.saveChats(filtered);
    } catch (error) {
      console.error('Failed to delete chat from localStorage:', error);
    }
  },

  // Save current chat ID
  saveCurrentChatId: (chatId: string | null): void => {
    if (typeof window === 'undefined') return;
    try {
      if (chatId) {
        localStorage.setItem(CURRENT_CHAT_KEY, chatId);
      } else {
        localStorage.removeItem(CURRENT_CHAT_KEY);
      }
    } catch (error) {
      console.error('Failed to save current chat ID:', error);
    }
  },

  // Get current chat ID
  getCurrentChatId: (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(CURRENT_CHAT_KEY);
    } catch (error) {
      console.error('Failed to get current chat ID:', error);
      return null;
    }
  },

  // Clear all chat data
  clear: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CURRENT_CHAT_KEY);
    } catch (error) {
      console.error('Failed to clear chat storage:', error);
    }
  },
};

