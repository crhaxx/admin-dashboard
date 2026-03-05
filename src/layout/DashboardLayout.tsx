import { Link, Outlet } from "react-router-dom";

export default function DashboardLayout() {
    return (
        <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "220px",
          background: "#1e1e1e",
          color: "white",
          padding: "20px",
        }}
      >
        <h2>Dashboard</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Link to="/analytics" style={{ color: "white" }}>Analytics</Link>
          <Link to="/orders" style={{ color: "white" }}>Orders</Link>
          <Link to="/products" style={{ color: "white" }}>Products</Link>
          <Link to="/users" style={{ color: "white" }}>Users</Link>
        </nav>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </main>
    </div>

    )
}