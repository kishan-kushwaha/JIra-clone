import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.auth["reset-password"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.auth["reset-password"]["$post"]>;

export const useResetPassword = () => {
  const router = useRouter();
  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async ({ json }) => {
      const response = await client.api.auth["reset-password"]["$post"]({ json });

      if (!response.ok) {
        throw new Error("Failed to reset password");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Password reset successfully");
      router.push("/sign-in");
    },
    onError: () => {
      toast.error("Failed to reset password");
    }
  });

  return mutation;
};
