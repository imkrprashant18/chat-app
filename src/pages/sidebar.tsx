import {
        User as UserIcon,
        Users as UsersIcon,
        CheckCircle2,
        User,
        Plus,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useState } from "react";
import Scanner from "./Scanner";
import {
        Sheet,
        SheetContent,
        SheetTrigger,
} from "../components/ui/sheet";
import { useChatStore } from "../store";

interface MyInfo {
        id: string;
        name: string;
        publicEncryptionKey: string;
        publicSigningKey: string;
}

interface Friend {
        id: string;
        name: string;
        publicEncryptionKey: string;
        publicSigningKey?: string;
        addedAt: string;
}

interface SidebarProps {
        myInfo: MyInfo | null;
        friends: Record<string, Friend>;
        activeFriend: Friend | null;
        onSelectFriend: (friend: Friend) => void;
        isOpen: boolean;
}

const Sidebar = ({
        myInfo,
        friends,
        activeFriend,
        onSelectFriend,
        isOpen,
}: SidebarProps) => {
        const [open, setOpen] = useState(false);
        const { setActiveFriendId } = useChatStore();

        const handleSuccess = () => {
                setOpen(false);
                window.location.reload();
        };

        return (
                <aside
                        className={`
        fixed lg:static inset-y-0 left-0 z-40
        bg-gray-50 border-r shadow-lg
        transition-transform duration-300
        lg:w-80 w-72
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
                >
                        {/* User Info */}
                        <div className="p-4 border-b flex items-center gap-3">
                                <UserIcon className="w-9 h-9 text-indigo-600" />
                                <h2 className="font-semibold text-sm uppercase">
                                        {myInfo?.name ?? "Me"}
                                </h2>
                        </div>

                        {/* Friends */}
                        <div className="flex-1 overflow-y-auto">
                                {Object.values(friends).length === 0 && (
                                        <p className="p-4 text-sm text-gray-400 flex items-center gap-2">
                                                <User className="w-5 h-5" />
                                                No friends yet
                                        </p>
                                )}

                                {Object.values(friends).map((friend) => {
                                        const isActive = activeFriend?.id === friend.id;

                                        return (
                                                <button
                                                        key={friend.id}
                                                        onClick={() => {
                                                                onSelectFriend(friend);
                                                                setActiveFriendId(friend.id);
                                                        }}
                                                        className={`
                w-full flex items-center gap-3 p-4 border-b transition
                hover:bg-indigo-100
                ${isActive ? "bg-indigo-200" : ""}
              `}
                                                >
                                                        <UsersIcon className="w-6 h-6 text-indigo-600" />
                                                        <div className="flex-1 text-left">
                                                                <p className="font-medium">{friend.name}</p>
                                                        </div>
                                                        {isActive && (
                                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                        )}
                                                </button>
                                        );
                                })}
                        </div>

                        {/* Add Contact */}
                        <Sheet open={open} onOpenChange={setOpen}>
                                <SheetTrigger asChild>
                                        <div className="p-4">
                                                <Button className="bg-blue-600 w-full rounded hidden sm:flex">
                                                        Add Contact
                                                </Button>
                                                <Button className="bg-blue-600 w-full rounded sm:hidden flex">
                                                        <Plus />
                                                </Button>
                                        </div>
                                </SheetTrigger>

                                <SheetContent side="left" className="max-w-sm">
                                        <Scanner onSuccess={handleSuccess} />
                                </SheetContent>
                        </Sheet>
                </aside>
        );
};

export default Sidebar;
