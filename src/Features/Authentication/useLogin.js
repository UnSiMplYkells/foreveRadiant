import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { login as loginApi } from "../../Services/apiAuth";
import { toast } from "react-hot-toast";

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: login, isLoading, isPending } = useMutation({
    mutationFn: ({ email, password }) => loginApi({ email, password }),
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user.user);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["userRole"] });
      toast.success("Welcome back to Forever Radiant!");
      setTimeout(() => navigate("/home", { replace: true }), 400);
    },
    onError: (err) => {
      console.error("Login error:", err);
      toast.error(err.message || "Incorrect email or password");
    },
  });

  return { login, isLoading: Boolean(isLoading || isPending) };
}
