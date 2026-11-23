import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProduct } from "../Services/apiProducts";
import toast from "react-hot-toast";

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  const { mutate: editProduct, isPending: isUpdating } = useMutation({
    mutationFn: ({ productId, productData }) => updateProduct(productId, productData),
    onSuccess: (data) => {
      toast.success(`Product "${data.name}" updated successfully!`);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", data.id] });
    },
    onError: (err) => {
      toast.error(`Update failed: ${err.message}`);
    },
  });

  return { editProduct, isUpdating };
}
