import { useNavigate } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react"; // Make sure to install lucide-react

interface Friend {
        id: string;
        name: string;
        publicEncryptionKey: string;
        publicSigningKey?: string;
        addedAt: string;
}

const Contact = () => {
        const friends = JSON.parse(sessionStorage.getItem("friends") || "{}");
        const navigate = useNavigate();

        const handleFriendClick = (friendId: string) => {
                navigate(`/chats/${friendId}`);
        };

        return (
                <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
                        <div className=" mx-auto">
                                <button
                                        onClick={() => navigate(-1)}
                                        className="flex items-center text-gray-700 hover:text-gray-900 mb-6"
                                >
                                        <ArrowLeft className="h-5 w-5 mr-2" />
                                        <span className="font-medium">Back</span>
                                </button>

                                <div className="bg-white rounded-xl shadow-sm p-6">
                                        <h1 className="text-2xl font-bold text-gray-800 mb-6">Friends List</h1>

                                        {Object.values(friends).length > 0 ? (
                                                <ul className="space-y-3">
                                                        {Object.values(friends as Record<string, Friend>).map((friend: Friend) => (
                                                                <li
                                                                        key={friend.id}
                                                                        onClick={() => handleFriendClick(friend.id)}
                                                                        className="border border-gray-100 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                                                                >
                                                                        <div className="flex items-center space-x-3">
                                                                                <div className="p-2 bg-blue-100 rounded-full">
                                                                                        <User className="h-5 w-5 text-blue-600" />
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                        <div className="font-semibold text-gray-800">{friend.name}</div>
                                                                                </div>
                                                                                <div className="text-xs text-gray-400">
                                                                                        {new Date(friend.addedAt).toLocaleString("en-NP", {
                                                                                                dateStyle: "medium",
                                                                                                timeStyle: "short",
                                                                                        })}
                                                                                </div>
                                                                        </div>
                                                                </li>
                                                        ))}
                                                </ul>
                                        ) : (
                                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                                        <div className="p-3 bg-gray-100 rounded-full mb-4">
                                                                <User className="h-6 w-6 text-gray-400" />
                                                        </div>
                                                        <p className="text-gray-500 font-medium">No friends found.</p>
                                                        <p className="text-sm text-gray-400 mt-1">
                                                                Add friends to start chatting!
                                                        </p>
                                                </div>
                                        )}
                                </div>
                        </div>
                </div>
        );
};

export default Contact;
