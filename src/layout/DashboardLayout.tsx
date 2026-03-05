import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

export default function DashboardLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <aside
        style={{
          width: "220px",
          background: "#1e1e1e",
          color: "white",
          padding: "20px",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>Dashboard</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <NavLink to="/analytics" style={{ color: "white" }}>Analytics</NavLink>
          <NavLink to="/orders" style={{ color: "white" }}>Orders</NavLink>
          <NavLink to="/products" style={{ color: "white" }}>Products</NavLink>
          <NavLink to="/users" style={{ color: "white" }}>Users</NavLink>
        </nav>

        <button
          onClick={handleLogout}
          style={{
            marginTop: "30px",
            padding: "10px",
            background: "#ff4d4d",
            border: "none",
            color: "white",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </aside>

      <main style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </main>
    </div>
  );
}