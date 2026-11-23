import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../../Services/apiAuth";
import { fetchUserRole } from "../../Services/apiUsers";

export function useUser() {
  const { isLoading: isUserLoading, data: user } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
  });

  const userId = user?.id;

  const { data: userRole = "customer", isLoading: isRoleLoading } = useQuery({
    queryKey: ["userRole", userId],
    queryFn: () => fetchUserRole(userId),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });

  const role = user?.user_metadata?.role || userRole;
  const isAdmin = role === "admin";

  return {
    isLoading: isUserLoading || (Boolean(userId) && isRoleLoading),
    user,
    role,
    isAdmin,
    isAuthenticated: user?.role === "authenticated",
  };
}
