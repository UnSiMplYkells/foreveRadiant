import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder as createOrderApi} from "../../Services/apiOrder";
import toast from "react-hot-toast";

export function useCreateOrder(){
  const queryClient = useQueryClient()

  const {mutateAsync: createOrder, isPending: isCreatingOrder} = useMutation({
    mutationFn: ({userId, totalPrice, orderStatus, zipCode, shipTo, orderId, fullName, userEmail, contactInfo, promoCode, discountAmount}) => createOrderApi(userId, totalPrice, orderStatus, zipCode, shipTo, orderId, fullName, userEmail, contactInfo, promoCode, discountAmount),
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"])
      toast.success("Order placed successfully")
    },
    onError: (err) => {
      toast.error(err.message || "could not place order");
    },
  })

  return { createOrder, isCreatingOrder}
}
