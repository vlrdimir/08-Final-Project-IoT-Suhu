import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StateCreator } from "zustand";

export type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isStreaming?: boolean;
};

interface ChatState {
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;
}

type ChatPersist = (
  config: StateCreator<ChatState>,
  options: { name: string }
) => StateCreator<ChatState>;

export const useChatStore = create<ChatState>()(
  (persist as ChatPersist)(
    (set) => ({
      messages: [],
      addMessage: (message: Message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: "iot-chat-storage",
    }
  )
);
