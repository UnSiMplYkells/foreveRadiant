import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createPromoCode,
  deletePromoCode,
  fetchAllPromoCodes,
  updatePromoCode,
} from "../Services/apiPromos";

export function useAdminPromoCodes() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-promo-codes"],
    queryFn: fetchAllPromoCodes,
    staleTime: 30 * 1000,
  });

  return {
    promoCodes: data?.items || [],
    schemaMissing: Boolean(data?.schemaMissing),
    isLoading,
    error,
  };
}

export function useCreatePromoCode() {
  const queryClient = useQueryClient();

  const { mutateAsync: createPromo, isPending: isCreating } = useMutation({
    mutationFn: createPromoCode,
    onSuccess: (created) => {
      toast.success(`Promo code ${created.code} issued.`);
      queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create promo code");
    },
  });

  return { createPromo, isCreating };
}

export function useUpdatePromoCode() {
  const queryClient = useQueryClient();

  const { mutateAsync: updatePromo, isPending: isUpdating } = useMutation({
    mutationFn: updatePromoCode,
    onSuccess: (updated) => {
      toast.success(
        updated.is_active
          ? `${updated.code} is now active.`
          : `${updated.code} has been turned off.`
      );
      queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update promo code");
    },
  });

  return { updatePromo, isUpdating };
}

export function useDeletePromoCode() {
  const queryClient = useQueryClient();

  const { mutateAsync: removePromo, isPending: isDeleting } = useMutation({
    mutationFn: deletePromoCode,
    onSuccess: () => {
      toast.success("Promo code deleted.");
      queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete promo code");
    },
  });

  return { removePromo, isDeleting };
}
