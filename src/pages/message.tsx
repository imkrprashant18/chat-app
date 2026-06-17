
import { useState, useEffect, useMemo, useCallback } from "react";
import { useMessages } from "../api/getMessage";
import {
        importEncryptionPrivateKey,
        importSigningPublicKey,
        verifyAndDecrypt,
} from "../lib/crypto";
import { toast } from "sonner";
import MessageData from "./msg-data";

export type Message = {
        id: string | number;
        message: string; // decrypted text
        createdBy: string;
        guid: string;
        createdAt?: string;
        createdDate?: string;
        isMine?: boolean;
};
interface Friend {
        id: string;
        name: string;
        publicEncryptionKey: string;
        publicSigningKey?: string;
        addedAt: string;
}


interface MessageProps {
        id: string; // friend ID
}
const POLLING_INTERVAL = 2000;
const Message = ({ id }: MessageProps) => {
        const myInfo = JSON.parse(sessionStorage.getItem("myInfo") || "{}");
        const friendsObj = JSON.parse(sessionStorage.getItem("friends") || "{}");
        const friends = Object.values(friendsObj);
        const mineMesage = sessionStorage.getItem("myMessages")
                ? JSON.parse(sessionStorage.getItem("myMessages") || "[]")
                : [];
        const [friendMessages, setFriendMessages] = useState<Message[]>([]);
        const [myMessages, setMyMessages] = useState<Message[]>([]);
        const [decryptedMessages, setDecryptedMessages] = useState<Message[]>([]);
        const [isDecrypting, setIsDecrypting] = useState(false);

        const { data: fetchedFriendMessages = [], refetch: refetchFriendMessages } = useMessages(id);
        const { data: fetchedMyMessages = [], refetch: refetchMyMessages } = useMessages(myInfo.id);

        const fetchMessages = useCallback(async () => {
                try {
                        await refetchFriendMessages();
                        await refetchMyMessages();
                } catch (error) {
                        console.error("Error fetching messages:", error);
                }
        }, [refetchFriendMessages, refetchMyMessages]);
        useEffect(() => {
                fetchMessages(); // initial fetch
                setFriendMessages(fetchedFriendMessages);
                setMyMessages(fetchedMyMessages);
        }, [fetchedFriendMessages, fetchedMyMessages, fetchMessages]);

        useEffect(() => {
                const intervalId = setInterval(() => { fetchMessages() }, POLLING_INTERVAL);

                return () => clearInterval(intervalId); // cleanup on unmount
        }, [id, myInfo.id, fetchMessages]);
        // Get friend info - memoized to prevent recalculation
        const friend = useMemo(() => {
                return friends.find((f) => (f as Friend).id === id) as Friend | undefined;
        }, [friends, id]);

        // Decrypt messages when data changes
        useEffect(() => {
                const decryptAllMessages = async () => {
                        if (!myInfo.privateEncryptionKey || !friend?.publicSigningKey) {
                                toast.error("Missing keys for decryption");
                                return;
                        }

                        setIsDecrypting(true);
                        try {
                                const myPrivateKey = await importEncryptionPrivateKey(
                                        myInfo.privateEncryptionKey
                                );
                                const friendSigningKey = await importSigningPublicKey(
                                        friend.publicSigningKey
                                );

                                // Combine all messages (sent by me to friend + received from friend)
                                const allMessages = [
                                        ...friendMessages.map((msg: Message) => ({
                                                ...msg,
                                                isMine: true,
                                        })),
                                        ...myMessages
                                                .filter((msg: Message) => msg.createdBy === myInfo.id)
                                                .map((msg: Message) => ({
                                                        ...msg,
                                                        isMine: false,
                                                })),
                                ];

                                // Decrypt each message
                                const decrypted = await Promise.all(
                                        allMessages.map(async (msg: Message) => {
                                                try {
                                                        const payload = JSON.parse(msg.message);
                                                        const decryptedText = await verifyAndDecrypt(
                                                                payload,
                                                                friendSigningKey,
                                                                myPrivateKey
                                                        );

                                                        return {
                                                                id: msg.id || msg.guid,
                                                                message: decryptedText,
                                                                createdBy: msg.createdBy,
                                                                guid: msg.guid,
                                                                createdAt: msg.createdDate,
                                                                isMine: msg.isMine,
                                                        };
                                                } catch (error) {
                                                        console.error("Failed to decrypt message:", error);
                                                        return {
                                                                id: msg.id || msg.guid,
                                                                message: "[Failed to decrypt]",
                                                                createdBy: msg.createdBy,
                                                                guid: msg.guid,
                                                                createdAt: msg.createdAt,
                                                                isMine: msg.isMine,
                                                        };
                                                }
                                        })
                                );

                                // Sort by timestamp (oldest first)
                                decrypted.sort((a, b) => {
                                        if (!a.createdAt || !b.createdAt) return 0;
                                        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                                });

                                setDecryptedMessages(decrypted);
                        } catch (error) {
                                console.error("Decryption error:", error);
                        } finally {
                                setIsDecrypting(false);
                        }
                };

                decryptAllMessages();
        }, [friendMessages.length, myMessages.length, myInfo.privateEncryptionKey, friend?.publicSigningKey, myInfo.id, friendMessages, myMessages]);

        if (isDecrypting) {
                return (
                        <div className="flex flex-col gap-2 p-4 h-full overflow-y-auto bg-gray-100 rounded-md">
                                <div className="text-center text-gray-500">Decrypting messages...</div>
                        </div>
                );
        }


        return (
                <div className="flex flex-col gap-2 p-4 h-full overflow-y-auto bg-gray-100 rounded-md">
                        <MessageData decryptedMessages={decryptedMessages} mineMesage={mineMesage} />
                </div>
        );
};

export default Message;