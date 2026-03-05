import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

// Pages
import AnalyticsPage from "../pages/analytics/AnalyticsPage";
import OrdersPage from "../pages/orders/OrdersPage";
import ProductsPage from "../pages/products/ProductsPage";
import UsersPage from "../pages/users/UsersPage";
import LoginPage from "../pages/login/LoginPage";

const router = createBrowserRouter([
    {
        path: "/login",
        element: <LoginPage />
    },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AnalyticsPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "orders", element: <OrdersPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "users", element: <UsersPage /> },
    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}