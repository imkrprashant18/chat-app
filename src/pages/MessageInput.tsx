
import { useState, type KeyboardEvent } from "react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

import {
        encryptAndSign,
        importEncryptionPublicKey,
        importSigningPrivateKey,
} from "../lib/crypto";

import { useSendMessage } from "../api/sendMessage";
import { toast } from "sonner";

interface Friend {
        id: string;
        name: string;
        publicEncryptionKey: string;
        publicSigningKey: string;

}



interface Props {
        friendId: string;
}
const MessageInput = ({ friendId }: Props) => {

        const { mutateAsync } = useSendMessage();
        const [message, setMessage] = useState("");

        const handleSend = async () => {
                if (!message.trim() || !friendId) return;

                try {
                        const myInfo = JSON.parse(sessionStorage.getItem("myInfo") || "{}");
                        if (!myInfo.privateSigningKey) throw new Error("My signing key missing");

                        const friends: Record<string, Friend> = JSON.parse(
                                sessionStorage.getItem("friends") || "{}"
                        );
                        const friend = Object.values(friends).find(
                                (f) => f.id === friendId
                        );
                        if (!friend) {
                                toast.error("Friend not found");
                                return;
                        }

                        const receiverPublicKey = await importEncryptionPublicKey(friend.publicEncryptionKey);
                        const senderSigningPrivateKey = await importSigningPrivateKey(myInfo.privateSigningKey);

                        // Encrypt only for sending to friend
                        const encryptedPayload = await encryptAndSign(
                                message,
                                receiverPublicKey,
                                senderSigningPrivateKey
                        );

                        // Send to backend
                        await mutateAsync({
                                userId: friendId,
                                message: JSON.stringify(encryptedPayload),
                                signature: encryptedPayload.signature,
                        });

                        // Optionally, store your own message locally in raw text
                        const myMessages = JSON.parse(sessionStorage.getItem("myMessages") || "[]");
                        myMessages.push({
                                id: Date.now(),
                                message, // raw text
                                createdBy: myInfo.id,
                                guid: crypto.randomUUID(),
                                createdAt: new Date().toISOString(),
                                isMine: true,
                        });
                        sessionStorage.setItem("myMessages", JSON.stringify(myMessages));

                        setMessage("");
                } catch (err) {
                        console.error("Send failed:", err);
                        alert("Failed to send encrypted message");
                }
        };

        const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                }
        };

        return (
                <footer className="p-4 border-t bg-background">
                        <div className="flex items-center gap-2">
                                <Input
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Type a message"
                                        className="flex-1 rounded-full px-4"
                                />
                                <Button
                                        onClick={handleSend}
                                        disabled={!message.trim()}
                                        className="rounded-full px-6 bg-green-600 hover:bg-green-500 transition-colors duration-300 ease-in-out"
                                >
                                        Send
                                </Button>
                        </div>
                </footer>
        );
};

export default MessageInput;
