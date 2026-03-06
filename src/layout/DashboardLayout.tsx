import { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import defaultpfp from "../assets/defaultpfp.png";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <h2 style={{ marginBottom: "20px" }}>Dashboard</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <NavLink to="/analytics" style={{ color: "white" }}>Analytics</NavLink>
          <NavLink to="/orders" style={{ color: "white" }}>Orders</NavLink>
          <NavLink to="/products" style={{ color: "white" }}>Products</NavLink>
          <NavLink to="/users" style={{ color: "white" }}>Users</NavLink>
        </nav>
      </aside>

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* Top Bar */}
        <header
          style={{
            height: "60px",
            background: "#f5f5f5",
            borderBottom: "1px solid #ddd",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
          }}
        >
          <h3 style={{ margin: 0 }}>Welcome {user?.firstName}</h3>

          {/* Dropdown */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <div
              onClick={() => setOpen((prev) => !prev)}
              style={{
                cursor: "pointer",
                padding: "8px 12px",
                background: "#e0e0e0",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
                {user?.photoURL ? (
  <img
    src={user?.photoURL}
    style={{
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      objectFit: "cover",
    }}
  />
) : (
  <img
    src={defaultpfp}
    style={{
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      objectFit: "cover",
    }}
  />
)}
              <span>{user?.firstName} {user?.lastName}</span>
              <span style={{ fontSize: "12px" }}>{open ? "▲" : "▼"}</span>
            </div>

            {open && (
              <div
                style={{
                  position: "absolute",
                  top: "45px",
                  right: 0,
                  background: "white",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                  width: "160px",
                  zIndex: 10,
                }}
              >
                <button
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "white",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    navigate("/profile");
                    setOpen(false);
                  }}
                >
                  Profile
                </button>

                <button
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "white",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    color: "red",
                  }}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: "20px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}