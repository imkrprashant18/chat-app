import { useEffect, useState } from "react";

import MessageInput from "./MessageInput";
import ChatHeader from "./Header";
import Sidebar from "./sidebar";
import Message from "./message";
import MYQR from "./MyQR";
import { useChatStore } from "../store";


export interface Friend {
        id: string
        name: string;
        publicEncryptionKey: string; // Base64 encoded
        publicSigningKey?: string; // Base64 encoded
        addedAt: string;
}

export interface MyInfo {
        id: string;
        name: string;
        publicEncryptionKey: string;
        publicSigningKey: string;
}

const ChatsPage = () => {
        const [myInfo, setMyInfo] = useState<MyInfo | null>(null);
        const [friends, setFriends] = useState<Record<string, Friend>>({});
        const [activeFriend, setActiveFriend] = useState<Friend | null>(null);
        const [showQR, setShowQR] = useState(true);
        const [isSidebarOpen, setIsSidebarOpen] = useState(true);
        useEffect(() => {
                const storedMyInfo = sessionStorage.getItem("myInfo");
                const storedFriends = sessionStorage.getItem("friends");
                // Defer state updates to avoid cascading renders
                setTimeout(() => {
                        if (storedMyInfo) {
                                setMyInfo(JSON.parse(storedMyInfo));
                        }

                        if (storedFriends) {
                                setFriends(JSON.parse(storedFriends));
                        }
                }, 0);

                // The dependency array is empty, so this effect runs once on mount.
        }, []);

        const { activeFriendId } = useChatStore()














        return (
                <div className="h-screen flex bg-background relative">
                        {/* <div className="absolute min-hscreen   -inset-2 opacity-40 flex justify-center items-center">
                                <MYQR />
                        </div> */}

                        <Sidebar
                                myInfo={myInfo}
                                friends={friends}
                                activeFriend={activeFriend}
                                isOpen={isSidebarOpen}
                                onSelectFriend={(friend) => {
                                        setActiveFriend(friend);
                                        setIsSidebarOpen(false); // 👈 close sidebar on mobile
                                }}
                        />

                        <main className="flex-1 flex flex-col">
                                <ChatHeader activeFriend={activeFriend} onBack={() => setIsSidebarOpen(true)} />

                                <div className="flex-1 p-4 overflow-y-auto bg-[url('/chat-bg.svg')]">
                                        {!activeFriend ? (
                                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                                        Messages are end-to-end encrypted
                                                </div>
                                        ) : <Message id={activeFriendId || ""} />}
                                </div>

                                {activeFriend && <MessageInput friendId={activeFriendId || ""} />}
                        </main>
                        {showQR && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center   ">
                                        <div
                                                className="absolute inset-0 bg-black/50"
                                                onClick={() => setShowQR(false)}
                                        />
                                        <div className="relative z-10 bg-white  sm:w-[400px] w-[300px] rounded-xl p-6 shadow-xl">
                                                <button
                                                        onClick={() => setShowQR(false)}
                                                        className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500 text-white"
                                                >
                                                        ✕
                                                </button>
                                                <MYQR />
                                        </div>
                                </div>
                        )}
                </div>
        );
};

export default ChatsPage
