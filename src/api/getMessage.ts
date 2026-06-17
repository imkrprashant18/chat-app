import { useQuery } from "@tanstack/react-query";
import api from "../request";

export type Message = {
        id: number;             // message database ID
        message: string;        // actual message text
        createdBy: string;      // user who created the message
        guid: string;           // unique message identifier (UUID)
        createdAt?: string;
};

export const fetchMessages = async (userId: string): Promise<Message[]> => {
        const res = await api.get(`/messages/${userId}`);
        return res.data;
};

export const useMessages = (userId: string) => {
        return useQuery({
                queryKey: ["messages", userId],
                queryFn: () => fetchMessages(userId),
                enabled: !!userId,
        });
}