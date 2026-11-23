import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProduct } from "../Services/apiProducts";
import toast from "react-hot-toast";

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  const { mutate: removeProduct, isPending: isDeleting } = useMutation({
    mutationFn: (productId) => deleteProduct(productId),
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => {
      toast.error(`Delete failed: ${err.message}`);
    },
  });

  return { removeProduct, isDeleting };
}
