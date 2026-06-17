import { useEffect, useRef } from "react";


type Message = {
        id: string | number;
        message: string; // decrypted text
        createdBy: string;
        guid: string;
        createdAt?: string;
        isMine?: boolean;
};
interface Props {
        mineMesage: Message[];
        decryptedMessages: Message[];

}
const MessageData = ({ mineMesage, decryptedMessages }: Props) => {
        const chatContainerRef = useRef<HTMLDivElement>(null);
        const friednDecryptedMessage = decryptedMessages.filter((msg) => msg.isMine === false);
        const allMessages: Message[] = [...mineMesage, ...friednDecryptedMessage]?.sort(
                (a, b) => {
                        const timeA = new Date(a.createdAt || 0).getTime();
                        const timeB = new Date(b.createdAt || 0).getTime();
                        return timeA - timeB;
                }
        );
        const groupedMessages = allMessages?.map((msg, index, arr) => {
                const prev = arr[index - 1];
                const showSender = !prev || prev.createdBy !== msg.createdBy;
                return { ...msg, showSender };
        });
        useEffect(() => {
                if (chatContainerRef.current) {
                        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                }
        }, [groupedMessages]);


        if (groupedMessages.length === 0) {
                return <div className="text-center text-gray-500 mt-4">No messages yet</div>;
        }

        return (
                <>
                        <div
                                id="chat-container"
                                ref={chatContainerRef}
                                className="overflow-y-auto h-full p-2 flex flex-col no-scrollBar"
                        >
                                {groupedMessages?.map((msg) => (
                                        <div
                                                key={msg.guid}
                                                className={`flex ${msg.isMine ? "justify-end" : "justify-start"} mb-1`}
                                        >
                                                <div
                                                        className={`max-w-[70%] px-4 py-2 rounded-lg break-words ${msg.isMine ? "bg-orange-500 text-white" : "bg-blue-500 text-white"
                                                                }`}
                                                >

                                                        {/* {!msg.isMine && msg.showSender && (
                                                                <p className="text-sm font-semibold mb-1">{msg.createdBy}</p>
                                                        )} */}

                                                        <p className="text-sm">{msg.message}</p>

                                                        {msg.createdAt && (
                                                                <span className="text-xs text-gray-200 mt-1 block text-right">
                                                                        {new Date(msg.createdAt).toLocaleTimeString([], {
                                                                                hour: "2-digit",
                                                                                minute: "2-digit",
                                                                        })}
                                                                </span>
                                                        )}
                                                </div>
                                        </div>
                                ))}
                        </div>
                </>
        )
}

export default MessageData