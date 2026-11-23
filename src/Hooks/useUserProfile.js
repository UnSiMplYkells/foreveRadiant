import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "../Features/Authentication/useUser";
import { fetchUpdatedUserDetails, fetchUserRole, updateUserDetails } from "../Services/apiUsers";
import toast from "react-hot-toast";

/**
 * Hook to retrieve user profile details (addresses, phone numbers, role)
 */
export function useUserDetailed() {
  const { user } = useUser();
  const userId = user?.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ["users", userId],
    queryFn: () => fetchUpdatedUserDetails(userId),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });

  return { data, isLoading, error };
}

/**
 * Hook to update user profile details
 */
export function useUpdateUserDetails() {
  const queryClient = useQueryClient();

  const { mutate: updatedUserDetails, isPending: isUpdatingUserDetails } = useMutation({
    mutationFn: ({ userId, ...updates }) => updateUserDetails(userId, updates),
    onSuccess: (res, variables) => {
      if (res?.noChanges) {
        toast("No changes detected - details already up to date");
      } else if (res?.newDetailItem) {
        toast.success("Profile details saved successfully");
      } else if (res?.updated) {
        toast.success("Profile details updated successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["users", variables.userId] });
    },
    onError: (error) => {
      toast.error(`Update failed: ${error.message}`);
    },
  });

  return { updatedUserDetails, isUpdatingUserDetails };
}

/**
 * Hook to check current user role ('customer' or 'admin')
 */
export function useUserRole() {
  const { user, isLoading: isAuthLoading } = useUser();
  const userId = user?.id;

  const { data: role = "customer", isLoading: isRoleLoading } = useQuery({
    queryKey: ["userRole", userId],
    queryFn: () => fetchUserRole(userId),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });

  return {
    role,
    isAdmin: role === "admin",
    isLoading: isAuthLoading || isRoleLoading,
  };
}

/**
 * Convenience hook providing current user + admin role status
 */
export function useUserProfile() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useUser();
  const { role, isAdmin, isLoading: isRoleLoading } = useUserRole();
  return {
    user,
    role,
    isAdmin,
    isAuthenticated: Boolean(isAuthenticated || user?.role === "authenticated"),
    isLoading: isAuthLoading || isRoleLoading,
  };
}
