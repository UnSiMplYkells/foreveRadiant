import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateOrderStatus as updateOrderStatusApi,
  confirmOrderPayment as confirmOrderPaymentApi,
} from "../../Services/apiOrder";
import toast from "react-hot-toast";

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  const { mutate: updateOrderStatus, isPending: isUpdating } = useMutation({
    mutationFn: ({ orderId, newStatus }) => updateOrderStatusApi(orderId, newStatus),
    onSuccess: (data, variables) => {
      toast.success(`Order status updated to ${variables.newStatus}`);
      queryClient.invalidateQueries({ queryKey: ["all-orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-kpis"] });
      queryClient.invalidateQueries({ queryKey: ["sales-trends"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update order status", {
        duration: 4500,
      });
    },
  });

  const { mutate: confirmPayment, isPending: isConfirming } = useMutation({
    mutationFn: ({ orderId, paymentMethod }) => confirmOrderPaymentApi(orderId, paymentMethod),
    onSuccess: () => {
      toast.success("Payment verified! Order moved into Processing pipeline.");
      queryClient.invalidateQueries({ queryKey: ["all-orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-kpis"] });
      queryClient.invalidateQueries({ queryKey: ["sales-trends"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to confirm payment", {
        duration: 4000,
      });
    },
  });

  return { updateOrderStatus, isUpdating, confirmPayment, isConfirming };
}
