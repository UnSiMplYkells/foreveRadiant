import { useMutation } from "@tanstack/react-query";
import { uploadProductImage } from "../Services/apiProducts";
import toast from "react-hot-toast";

export function useUploadProductImage() {
  const { mutateAsync: uploadImage, isPending: isUploading } = useMutation({
    mutationFn: (file) => uploadProductImage(file),
    onError: (err) => {
      toast.error(`Image upload failed: ${err.message}`);
    },
  });

  return { uploadImage, isUploading };
}
