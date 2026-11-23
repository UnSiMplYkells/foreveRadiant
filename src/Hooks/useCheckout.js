import { useMutation, useQueryClient } from "@tanstack/react-query";
import { processCheckoutRPC } from "../Services/apiOrder";
import toast from "react-hot-toast";

/**
 * Concurrency-safe checkout hook executing PostgreSQL pessimistic row-level locking RPC
 */
export function useCheckout() {
  const queryClient = useQueryClient();

  const { mutateAsync: executeCheckout, isPending: isCheckingOut } = useMutation({
    mutationFn: ({ orderId, items }) => processCheckoutRPC(orderId, items),
    onSuccess: () => {
      toast.success("Order verified and inventory updated!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err) => {
      toast.error(`Checkout failed: ${err.message}`);
    },
  });

  return { executeCheckout, isCheckingOut };
}
