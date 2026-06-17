
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../request";

type SendMessagePayload = {
        message: string;
        userId: string;
        signature: string
};

export const useSendMessage = () => {
        const queryClient = useQueryClient();

        return useMutation({
                mutationFn: async (payload: SendMessagePayload) => {
                        const res = await api.post("/messages/send-message",
                                payload
                        );


                        return res
                },
                onSuccess: (_data, variables) => {
                        queryClient.invalidateQueries({ queryKey: ["messages", variables.userId] });
                },
        });
};
