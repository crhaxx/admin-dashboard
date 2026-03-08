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
  Sun,
  Moon,
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
    <div className="flex min-h-screen transition-colors duration-300">

      {/* Sidebar */}
      <aside
  className="
    fixed left-0 top-0 h-screen w-[250px]
    bg-white text-gray-900 border-r border-gray-200
    dark:bg-[#242424] dark:text-white dark:border-[#222]
    flex flex-col p-6
  "
>

  {/* Logo */}
  <div className="flex flex-col items-center mb-4">
    <img
      src="/logo/prodify-logo.png"
      alt="logo"
      onClick={() => navigate("/")}
      className="w-[120px] h-[120px] object-cover mb-[-8px]"
    />
    <h2 className="text-[22px] font-semibold mt-2">Prodify Dashboard</h2>
  </div>

  {/* Navigation */}
  <nav className="flex flex-col gap-1 mt-2">
    {[
      { to: "/", label: "Dashboard", icon: <LayoutDashboard size={20} color="#D6BEFA" /> },
      { to: "/analytics", label: "Analytics", icon: <BarChart2 size={20} color="#D6BEFA" /> },
      { to: "/orders", label: "Orders", icon: <ShoppingCart size={20} color="#D6BEFA" /> },
      { to: "/products", label: "Products", icon: <Package size={20} color="#D6BEFA" /> },
      { to: "/users", label: "Users", icon: <Users size={20} color="#D6BEFA" /> },
    ].map((item) => (
      <NavLink
  key={item.to}
  to={item.to}
  className={({ isActive }) =>
    `relative flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] transition-all
    ${
      isActive
        ? "bg-gray-100 dark:bg-[#111] font-semibold"
        : "hover:bg-gray-100 dark:hover:bg-[#111] hover:translate-x-1"
    }`
  }
>
        {({ isActive }) => (
          <>
            {isActive && (
              <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#60d4df] rounded-r-md"></div>
            )}
            <span className="opacity-90">{item.icon}</span>
            <span>{item.label}</span>
          </>
        )}
      </NavLink>
    ))}
  </nav>

  {/* Management */}
  <div className="mt-6">
    <details className="group">
      <summary className="cursor-pointer px-2 py-2 text-sm font-semibold text-black dark:text-gray-300 hover:text-gray-500 dark:hover:text-white  transition flex items-center justify-between">
        Management
        <span className="transition-transform group-open:rotate-180">▼</span>
      </summary>

      <div className="ml-3 mt-2 flex flex-col gap-2">
        <NavLink className="text-black dark:text-gray-300 hover:text-gray-500 dark:hover:text-white text-sm px-2 py-1 rounded transition" to="/settings">
          Settings
        </NavLink>
        <NavLink className="text-black dark:text-gray-300 hover:text-gray-500 dark:hover:text-white  text-sm px-2 py-1 rounded transition" to="/billing">
          Billing
        </NavLink>
        <NavLink className="text-black dark:text-gray-300 hover:text-gray-500 dark:hover:text-white  text-sm px-2 py-1 rounded transition" to="/logs">
          Logs
        </NavLink>
      </div>
    </details>
  </div>

  <div className="flex-1"></div>

  {/* Footer */}
  <div className="text-center text-xs text-gray-400 mt-2">
    Prodify © {new Date().getFullYear()}
    <br />
    Build smarter. Manage faster.
  </div>
</aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 ml-[250px]">

        {/* Top Bar */}
        <header className="h-[65px] bg-white dark:bg-[#111] border-b border-gray-200 dark:border-[#333] flex items-center justify-between px-6">
          <h3 className="text-[20px] font-medium text-black dark:text-white">
            Welcome {user?.firstName}
          </h3>

          {/* Dropdown */}
          <div ref={dropdownRef} className="relative">
            <div
              onClick={() => setOpen((prev) => !prev)}
              className="cursor-pointer px-4 py-2 bg-[#f0f0f0] dark:bg-[#454545] rounded-lg flex items-center gap-3 transition"
            >
              <img
                src={user?.photoURL || defaultpfp}
                className="w-[34px] h-[34px] rounded-full object-cover"
              />
              <span className="text-black dark:text-white">{user?.firstName} {user?.lastName}</span>
              <span className="text-xs text-black dark:text-white">{open ? "▲" : "▼"}</span>
            </div>

            {open && (
              <div className="absolute top-12 right-0 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-lg shadow-lg w-[170px] z-10 animate-dropdown">
                <button
                  className="w-full px-4 py-3 bg-white dark:bg-[#111] text-left hover:bg-gray-100 dark:hover:bg-[#222] transition text-black dark:text-white"
                  onClick={() => {
                    navigate("/profile");
                    setOpen(false);
                  }}
                >
                  Profile
                </button>

                <button
                  className="w-full px-4 py-3 bg-white dark:bg-[#111] text-left text-red-500 hover:bg-gray-100 dark:hover:bg-[#222] transition"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 animate-fadeSlideIn">
          <Outlet />
        </main>
      </div>
    </div>
  );
}