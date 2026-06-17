import { ArrowLeft } from "lucide-react";


interface Friend {
        id: string;
        name: string;
        publicEncryptionKey: string;
        publicSigningKey?: string;
        addedAt: string;
}

interface ChatHeaderProps {
        activeFriend: Friend | null;
        onBack: () => void;
}

const ChatHeader = ({ activeFriend, onBack }: ChatHeaderProps) => {
        return (
                <header className="p-4 border-b bg-muted">
                        {activeFriend && (
                                <button
                                        onClick={onBack}
                                        className="lg:hidden p-1 rounded hover:bg-muted-foreground/10"
                                >
                                        <ArrowLeft className="w-5 h-5" />
                                </button>
                        )}
                        {activeFriend ? (
                                <>
                                        <h3 className="font-semibold">{activeFriend.name}</h3>
                                        <p className="text-xs text-muted-foreground">
                                                Verified via QR
                                        </p>
                                </>
                        ) : (
                                <p className="text-muted-foreground">
                                        Select a chat to start messaging
                                </p>
                        )}
                </header>
        );
};

export default ChatHeader;
