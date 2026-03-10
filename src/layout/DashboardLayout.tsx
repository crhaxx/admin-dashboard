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
import { useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function DashboardLayout() {
  const location = useLocation();
  const path = location.pathname;
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [storeName, setStoreName] = useState("");

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const greeting = getGreeting();

  useEffect(() => {
    const load = async () => {
      const ref = doc(db, "settings", "store");
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setStoreName(snap.data().storeName);
      }
    };

    load();
  }, []);

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
    <div className="flex min-h-screen transition-colors duration-300">
      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-[250px] bg-white text-gray-900 border-r border-gray-200
          flex flex-col p-6 z-50 transition-transform md:hidden
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-4">
          <img
            src="/logo/prodify-logo.png"
            alt="logo"
            onClick={() => navigate("/")}
            className="w-[120px] h-[120px] object-cover mb-[-8px] cursor-pointer hover:opacity-90 transition"
          />
          <h2 className="text-[22px] font-semibold mt-2 tracking-tight">
            {storeName} Dashboard
          </h2>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 mt-2">
          {[
            { to: "/", label: "Dashboard", icon: <LayoutDashboard size={20} color="#6366F1" /> },
            { to: "/analytics", label: "Analytics", icon: <BarChart2 size={20} color="#6366F1" /> },
            { to: "/orders", label: "Orders", icon: <ShoppingCart size={20} color="#6366F1" /> },
            { to: "/products", label: "Products", icon: <Package size={20} color="#6366F1" /> },
            { to: "/users", label: "Users", icon: <Users size={20} color="#6366F1" /> },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `
                relative flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] transition-all
                ${isActive
                  ? "bg-indigo-100 font-semibold text-indigo-700"
                  : "hover:bg-indigo-50 hover:text-indigo-600"
                }
              `
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-indigo-500 rounded-r-md"></div>
                  )}
                  <span className="opacity-90">{item.icon}</span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* Management */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="px-4 text-xs font-semibold text-gray-500 mb-2">
              Management
            </p>

            {[
              { to: "/settings", label: "Settings" },
              { to: "/billing", label: "Billing" },
              { to: "/logs", label: "Logs" },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `
                  block px-4 py-2 rounded-lg text-sm transition
                  ${isActive
                    ? "bg-indigo-100 font-semibold text-indigo-700"
                    : "hover:bg-indigo-50 hover:text-indigo-600 text-gray-700"
                  }
                `
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="mt-auto text-center text-xs text-gray-400">
          Prodify © {new Date().getFullYear()}
          <br />
          Build smarter. Manage faster.
        </div>
      </aside>

      {/* DESKTOP SIDEBAR */}
      <aside
        className="
          fixed left-0 top-0 h-screen w-[250px]
          bg-white text-gray-900 border-r border-gray-200
          flex flex-col p-6
          hidden md:flex
        "
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-4">
          <img
            src="/logo/prodify-logo.png"
            alt="logo"
            onClick={() => navigate("/")}
            className="w-[120px] h-[120px] object-cover mb-[-8px] cursor-pointer hover:opacity-90 transition"
          />
          <h2 className="text-[22px] font-semibold mt-2 tracking-tight">
            {storeName} Dashboard
          </h2>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 mt-2">
          {[
            { to: "/", label: "Dashboard", icon: <LayoutDashboard size={20} color="#6366F1" /> },
            { to: "/analytics", label: "Analytics", icon: <BarChart2 size={20} color="#6366F1" /> },
            { to: "/orders", label: "Orders", icon: <ShoppingCart size={20} color="#6366F1" /> },
            { to: "/products", label: "Products", icon: <Package size={20} color="#6366F1" /> },
            { to: "/users", label: "Users", icon: <Users size={20} color="#6366F1" /> },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `
                relative flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] transition-all
                ${isActive
                  ? "bg-indigo-100 font-semibold text-indigo-700"
                  : "hover:bg-indigo-50 hover:text-indigo-600"
                }
              `
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-indigo-500 rounded-r-md"></div>
                  )}
                  <span className="opacity-90">{item.icon}</span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* Management */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="px-4 text-xs font-semibold text-gray-500 mb-2">
              Management
            </p>

            {[
              { to: "/settings", label: "Settings" },
              { to: "/billing", label: "Billing" },
              { to: "/logs", label: "Logs" },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `
                  block px-4 py-2 rounded-lg text-sm transition
                  ${isActive
                    ? "bg-indigo-100 font-semibold text-indigo-700"
                    : "hover:bg-indigo-50 hover:text-indigo-600 text-gray-700"
                  }
                `
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="flex-1"></div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 mt-2">
          Prodify © {new Date().getFullYear()}
          <br />
          Build smarter. Manage faster.
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex flex-col flex-1 md:ml-[250px]">
        {/* Top Bar */}
        <header className="h-[65px] bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 flex items-center justify-between px-6">
          {/* Hamburger */}
          <button
            className="md:hidden p-3 text-2xl"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>

          {path === "/" ? (
            <h3 className="text-[20px] font-medium text-black">
              {greeting + ", " + user?.firstName + " 👋"}
            </h3>
          ) : (
            <span className="text-sm text-gray-500">Prodify Dashboard</span>
          )}

          {/* Dropdown */}
          <div ref={dropdownRef} className="relative">
            <div
              onClick={() => setOpen((prev) => !prev)}
              className="cursor-pointer px-4 py-2 bg-[#f0f0f0] rounded-lg flex items-center gap-3 transition"
            >
              <img
                src={user?.photoURL || defaultpfp}
                className="w-[34px] h-[34px] rounded-full object-cover"
              />
              <span className="text-black">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-xs text-black">{open ? "▲" : "▼"}</span>
            </div>

            {open && (
              <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg w-[170px] z-10 animate-dropdown">
                <button
                  className="w-full px-4 py-3 bg-white text-left hover:bg-gray-100 transition text-black"
                  onClick={() => {
                    navigate("/profile");
                    setOpen(false);
                  }}
                >
                  Profile
                </button>

                <button
                  className="w-full px-4 py-3 bg-white text-left text-red-500 hover:bg-gray-100 transition"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 md:px-6 pb-6 pt-2 animate-fadeSlideInd">
          <Outlet />
        </main>
      </div>
    </div>
  );
}