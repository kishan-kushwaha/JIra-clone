import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.auth["forgot-password"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.auth["forgot-password"]["$post"]>;

export const useForgotPassword = () => {
  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async ({ json }) => {
      const response = await client.api.auth["forgot-password"]["$post"]({ json });

      if (!response.ok) {
        throw new Error("Failed to send recovery email");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Recovery email sent");
    },
    onError: () => {
      toast.error("Failed to send recovery email");
    }
  });

  return mutation;
};
