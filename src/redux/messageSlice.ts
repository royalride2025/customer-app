import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MessageState {
  unreadMessages: {
    [chatId: string]: {
      hasNewMessages: boolean;
      lastMessageTime: number;
    };
  };
  isChatOpen: boolean;
  currentChatId: string | null;
}

const initialState: MessageState = {
  unreadMessages: {},
  isChatOpen: false,
  currentChatId: null,
};

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    addUnreadMessage: (state, action: PayloadAction<{ chatId: string; messageId: string }>) => {
      const { chatId, messageId } = action.payload;
      
      if (!state.unreadMessages[chatId]) {
        state.unreadMessages[chatId] = {
          hasNewMessages: false,
          lastMessageTime: 0,
        };
      }
      
      // Only show badge if chat is not currently open
      if (!state.isChatOpen || state.currentChatId !== chatId) {
        state.unreadMessages[chatId].hasNewMessages = true;
        state.unreadMessages[chatId].lastMessageTime = Date.now();
      }
      
      console.log('📨 Badge set for new message:', {
        chatId,
        messageId,
        hasNewMessages: state.unreadMessages[chatId].hasNewMessages
      });
    },
    
    markChatAsRead: (state, action: PayloadAction<string>) => {
      const chatId = action.payload;
      
      if (state.unreadMessages[chatId]) {
        state.unreadMessages[chatId].hasNewMessages = false;
        
        console.log('✅ Chat marked as read:', chatId);
      }
    },
    
    setChatOpen: (state, action: PayloadAction<{ isOpen: boolean; chatId: string | null }>) => {
      const { isOpen, chatId } = action.payload;
      state.isChatOpen = isOpen;
      state.currentChatId = chatId;
      
      // If chat is opened, mark it as read
      if (isOpen && chatId && state.unreadMessages[chatId]) {
        state.unreadMessages[chatId].hasNewMessages = false;
        
        console.log('💬 Chat opened and marked as read:', chatId);
      }
    },
    
    clearAllUnreadMessages: (state) => {
      Object.keys(state.unreadMessages).forEach(chatId => {
        state.unreadMessages[chatId].hasNewMessages = false;
      });
      
      console.log('🗑️ All unread messages cleared');
    },
    
    removeChat: (state, action: PayloadAction<string>) => {
      const chatId = action.payload;
      delete state.unreadMessages[chatId];
      
      console.log('🗑️ Chat removed from unread messages:', chatId);
    },
  },
});

export const {
  addUnreadMessage,
  markChatAsRead,
  setChatOpen,
  clearAllUnreadMessages,
  removeChat,
} = messageSlice.actions;

export default messageSlice.reducer;
