import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ChatState {
        activeFriendId: string | null;
        setActiveFriendId: (id: string | null) => void;
        clearActiveFriend: () => void;
}

export const useChatStore = create<ChatState>()(
        persist(
                (set) => ({
                        activeFriendId: null,

                        setActiveFriendId: (id) =>
                                set({ activeFriendId: id }),

                        clearActiveFriend: () =>
                                set({ activeFriendId: null }),
                }),
                {
                        name: "chat-store", // key in storage
                        partialize: (state) => ({
                                activeFriendId: state.activeFriendId,
                        }),
                }
        )
);
