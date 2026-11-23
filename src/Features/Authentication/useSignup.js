import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { signup as signupApi } from "../../Services/apiAuth";
import toast from "react-hot-toast";

export function useSignup(setActiveTab) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: signup, isLoading, isPending } = useMutation({
    mutationFn: signupApi,
    onSuccess: (data) => {
      if (data?.session && data?.user) {
        queryClient.setQueryData(["user"], data.user);
        queryClient.invalidateQueries({ queryKey: ["user"] });
        toast.success("Account created! Welcome to Forever Radiant.");
        navigate("/home", { replace: true });
      } else {
        toast.success(
          "Account created! Please check your email to verify your account or sign in."
        );
        if (typeof setActiveTab === "function") {
          setActiveTab("login");
        }
      }
    },
    onError: (error) => {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account. Please try again.");
    },
  });

  return { signup, isLoading: Boolean(isLoading || isPending) };
}
