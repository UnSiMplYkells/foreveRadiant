import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct } from "../Services/apiProducts";
import toast from "react-hot-toast";

export function useCreateProduct() {
  const queryClient = useQueryClient();

  const { mutate: addProduct, isPending: isCreating } = useMutation({
    mutationFn: (newProduct) => createProduct(newProduct),
    onSuccess: (data) => {
      toast.success(`Product "${data.name}" created successfully!`);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => {
      toast.error(`Failed to create product: ${err.message}`);
    },
  });

  return { addProduct, isCreating };
}
