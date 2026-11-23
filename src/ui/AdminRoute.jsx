import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useUser } from "../Features/Authentication/useUser";
import Loader from "./Loader";
import toast from "react-hot-toast";

export default function AdminRoute() {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, isAdmin } = useUser();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        toast.error("Please log in to access the Admin Dashboard", {
          duration: 2500,
          id: "admin-unauthenticated-error",
        });
        navigate("/login");
      } else if (!isAdmin) {
        toast.error("Access denied. Administrator privileges required.", {
          duration: 3000,
          id: "admin-unauthorized-error",
        });
        navigate("/home");
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, navigate]);

  if (isLoading) return <Loader />;

  if (!isAuthenticated || !isAdmin) return null;

  return <Outlet />;
}
