import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useUser } from "../Features/Authentication/useUser";
import Loader from "./Loader";
import toast from "react-hot-toast";

export default function ProtectedRoute() {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated } = useUser();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      toast.error("You have to be logged in", {
        duration: 2000,
        id: "protected-route-auth-error",
      });
      const timeoutId = setTimeout(() => {
        navigate("/login");
      }, 400);

      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) return <Loader />;

  if (!isAuthenticated) return null;

  return <Outlet />;
}
