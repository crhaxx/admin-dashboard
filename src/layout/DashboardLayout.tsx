import { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import defaultpfp from "../assets/defaultpfp.png";
import {
  LayoutDashboard,
  BarChart2,
  ShoppingCart,
  Package,
  Users,
} from "lucide-react";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

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
    <div style={{ display: "flex", height: "100vh", background: "#f5f6fa" }}>
      
      {/* Sidebar */}
      <aside
        style={{
          width: "250px",
          background: "#1e1e1e",
          color: "white",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          borderRight: "1px solid #2a2a2a",
        }}
      >
        <img
          src="/logo/prodify-logo.png"
          alt="logo"
          style={{
            width: "120px",
            height: "120px",
            objectFit: "cover",
            margin: "0 auto -8px auto",
          }}
        />

        <h2 style={{ marginBottom: "10px", fontSize: "22px", fontWeight: 600 }}>
          Prodify Dashboard
        </h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {[
            { to: "/", label: "Dashboard", icon: <LayoutDashboard color="#D6BEFA" size={20} /> },
            { to: "/analytics", label: "Analytics", icon: <BarChart2 color="#D6BEFA" size={20} /> },
            { to: "/orders", label: "Orders", icon: <ShoppingCart color="#D6BEFA" size={20} /> },
            { to: "/products", label: "Products", icon: <Package color="#D6BEFA" size={20} /> },
            { to: "/users", label: "Users", icon: <Users color="#D6BEFA" size={20} /> },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                "sidebar-link" + (isActive ? " active" : "")
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                borderRadius: "8px",
                color: "white",
                textDecoration: "none",
                fontSize: "15px",
                transition: "0.25s",
                position: "relative",
              }}
            >
              {({ isActive }) => (
                <>
                  {/* Left active indicator */}
                  {isActive && (
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: "4px",
                        background: "#60d4df", //4f8cff
                        borderRadius: "4px",
                      }}
                    />
                  )}

                  <span style={{ opacity: 0.9 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* Top Bar */}
        <header
          style={{
            height: "65px",
            background: "white",
            borderBottom: "1px solid #e5e5e5",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 500 }}>
            Welcome {user?.firstName}
          </h3>

          {/* Dropdown */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <div
              onClick={() => setOpen((prev) => !prev)}
              style={{
                cursor: "pointer",
                padding: "8px 14px",
                background: "#f0f0f0",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                transition: "0.2s",
              }}
            >
              <img
                src={user?.photoURL || defaultpfp}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <span>{user?.firstName} {user?.lastName}</span>
              <span style={{ fontSize: "12px" }}>{open ? "▲" : "▼"}</span>
            </div>

            {open && (
              <div
                style={{
                  position: "absolute",
                  top: "48px",
                  right: 0,
                  background: "white",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  width: "170px",
                  zIndex: 10,
                  animation: "fadeIn 0.15s ease-out",
                }}
              >
                <button
                  style={{
                    width: "100%",
                    padding: "12px",
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
                    padding: "12px",
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
        <main style={{ flex: 1, padding: "24px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}