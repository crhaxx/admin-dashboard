import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

// Pages
import AnalyticsPage from "../pages/AnalyticsPage";
import OrdersPage from "../pages/orders/OrdersPage";
import ProductsPage from "../pages/products/ProductsPage";
import UsersPage from "../pages/users/UsersPage";
import LoginPage from "../pages/authentication/LoginPage";
import RegisterPage from "../pages/authentication/RegisterPage";
import NotFound from "../pages/NotFound";
import ProfilePage from "../pages/ProfilePage";
import DashboardPage from "../pages/DashboardPage";
import OrderDetailPage from "../pages/orders/OrderDetailPage";
import UserDetailPage from "../pages/users/UserDetailPage";
import LogPage from "../pages/LogsPage";

const router = createBrowserRouter([
    {
        path: "/login",
        element: <LoginPage />
    },
    {
        path: "/register",
        element: <RegisterPage />
    },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "orders", element: <OrdersPage /> },
      { path: "order/:id", element: <OrderDetailPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "user/:id", element: <UserDetailPage /> },
      { path: "/profile", element: <ProfilePage /> },
      { path: "/logs", element: <LogPage /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}