import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import GlobalStyles from "./Styles/GlobalStyles";
import AppLayout from "./ui/AppLayout";
import ProtectedRoute from "./ui/ProtectedRoute";
import AdminRoute from "./ui/AdminRoute";
import Loader from "./ui/Loader";
import { DarkModeProvider } from "./Context/DarkModeContext";

// Lazy load pages
const Home = lazy(() => import("./Pages/Home"));
const Collections = lazy(() => import("./Pages/Collections"));
const AboutUs = lazy(() => import("./Pages/About"));
const Cart = lazy(() => import("./Pages/Cart"));
const Account = lazy(() => import("./Pages/Account"));
const Orders = lazy(() => import("./Pages/Orders"));
const PlaceOrder = lazy(() => import("./Pages/PlaceOrder"));
const FullProductDetails = lazy(() => import("./Pages/FullProductDetails"));
const Login = lazy(() => import("./Pages/Login"));
const PrivacyPolicy = lazy(() => import("./Pages/PrivacyPolicy"));
const PageNotFound = lazy(() => import("./Pages/PageNotFound"));

// Admin Multi-Page Architecture
const AdminLayout = lazy(() => import("./Features/Admin/AdminLayout"));
const AdminHome = lazy(() => import("./Pages/Admin/AdminHome"));
const AdminProducts = lazy(() => import("./Pages/Admin/AdminProducts"));
const AdminOrders = lazy(() => import("./Pages/Admin/AdminOrders"));
const AdminAnalytics = lazy(() => import("./Pages/Admin/AdminAnalytics"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

// Dynamic Page Titles
const DynamicTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const titles = {
      "/collection": "Forever Radiance - Collection",
      "/about": "Forever Radiance - About Us",
      "/cart": "Forever Radiance - Your Cart",
      "/place-order": "Forever Radiance - Place Orders",
      "/account": "Forever Radiance - Your Account",
      "/order": "Forever Radiance - Orders",
      "/admin": "Forever Radiance - Admin Overview",
      "/admin/products": "Forever Radiance - Products Management",
      "/admin/orders": "Forever Radiance - Orders & Fulfillment",
      "/admin/analytics": "Forever Radiance - Visual Analytics",
      "/login": "Forever Radiance - Login",
      "/signup": "Forever Radiance - Sign Up",
      "/privacyPolicy": "Forever Radiance - Privacy Policy",
    };

    document.title = titles[location.pathname] || "Forever Radiance";
  }, [location.pathname]);

  return null;
};

export default function App() {
  return (
    <DarkModeProvider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <GlobalStyles />
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={12}
          containerStyle={{ margin: "8px" }}
          toastOptions={{
            duration: 3000,
            style: {
              fontSize: "14px",
              maxWidth: "500px",
              padding: "12px 18px",
              borderRadius: "8px",
            },
          }}
        />
        <BrowserRouter>
          <DynamicTitle />
          <Suspense fallback={<div><Loader /></div>}>
            <Routes>
              <Route element={<AppLayout />}>
                <Route index element={<Navigate replace to="home" />} />
                <Route path="home" element={<Home />} />
                <Route path="collection" element={<Collections />} />
                <Route path="about" element={<AboutUs />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="cart" element={<Cart />} />
                  <Route path="place-order" element={<PlaceOrder />} />
                  <Route path="order" element={<Orders />} />
                  <Route path="orders" element={<Navigate replace to="/order" />} />
                  <Route path="account" element={<Account />} />
                </Route>
                {/* Protected Admin Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="admin" element={<AdminLayout />}>
                    <Route index element={<AdminHome />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                  </Route>
                </Route>
                <Route path="/productDetails/:productId" element={<FullProductDetails />} />
              </Route>
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Login defaultTab="signup" />} />
              <Route path="privacyPolicy" element={<PrivacyPolicy />} />
              <Route path="privacy-policy" element={<PrivacyPolicy />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </QueryClientProvider>
    </DarkModeProvider>
  );
}
