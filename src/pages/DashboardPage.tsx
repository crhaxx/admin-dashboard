import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../providers/ProductsProvider";
import {
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  Plus,
  UserPlus,
  LayoutDashboard,
} from "lucide-react";

export default function DashboardPage() {
  useEffect(() => {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/chart.js";
  script.onload = () => {
    const Chart = (window as any).Chart;

    // Revenue Chart
    new Chart(document.getElementById("revenueChart"), {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Revenue",
            data: [400, 520, 610, 700, 650, 800, 900],
            borderColor: "#4f46e5",
            tension: 0.4,
          },
        ],
      },
    });

    // Orders Chart
    new Chart(document.getElementById("ordersChart"), {
      type: "bar",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Orders",
            data: [12, 19, 7, 15, 22, 30, 25],
            backgroundColor: "#10b981",
          },
        ],
      },
    });
  };

  document.body.appendChild(script);
}, []);

const [openActions, setOpenActions] = useState(false);
const navigate = useNavigate();

const { products } = useProducts();


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black p-6 space-y-10">

      {/* Quick Actions */}
      <div className="flex justify-end">
        <div className="relative">
          <button
            onClick={() => setOpenActions((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-[#fffff] dark:hover:bg-[#CCCCCC] rounded-lg transition"
          >
            <Plus size={18} />
            <span>Create</span>
          </button>

          {openActions && (
            <div className="absolute right-0 mt-2 bg-white dark:bg-[#fffff] border border-gray-200 dark:border-[#333] rounded-lg shadow-lg w-44 z-20">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#CCCCCC] flex items-center gap-2">
                <Plus size={16} /> Add Product
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#CCCCCC] flex items-center gap-2">
                <ShoppingCart size={16} /> Create Order
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#CCCCCC] flex items-center gap-2">
                <UserPlus size={16} /> Invite User
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#CCCCCC] flex items-center gap-2">
                <Package size={16} /> Add Inventory
              </button>
            </div>
          )}
        </div>
        </div>


      {/* Dashboard Filters */}
      <div className="flex justify-end gap-2">
        {["Today", "Last 7 days", "Last 30 days", "Custom"].map((label) => (
          <button
            key={label}
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm transition"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      <h1 className="text-3xl font-semibold text-dark dark:text-white">Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Orders */}
        <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Orders</p>
              <h2 className="text-2xl font-bold mt-1">169</h2>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingCart className="text-blue-600" size={26} />
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Revenue</p>
              <h2 className="text-2xl font-bold mt-1">$4,896</h2>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="text-green-600" size={26} />
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Users</p>
              <h2 className="text-2xl font-bold mt-1">67</h2>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="text-purple-600" size={26} />
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Products</p>
              <h2 className="text-2xl font-bold mt-1">{products.length}</h2>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Package className="text-orange-600" size={26} />
            </div>
          </div>
        </div>
      </div>

      {/* Mini Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl shadow border">
          <h3 className="text-lg font-semibold mb-3">Revenue Trend</h3>
          <canvas id="revenueChart"></canvas>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border">
          <h3 className="text-lg font-semibold mb-3">Orders Trend</h3>
          <canvas id="ordersChart"></canvas>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <button onClick={() => navigate("/products")} className="flex items-center justify-between bg-white p-4 rounded-xl shadow hover:shadow-md transition border">
          <div>
            <h3 className="font-semibold text-gray-800">Manage Products</h3>
            <p className="text-gray-500 text-sm">Edit, add or remove items</p>
          </div>
          <Package className="text-gray-600" size={26} />
        </button>

        <button onClick={() => navigate("/orders")} className="flex items-center justify-between bg-white p-4 rounded-xl shadow hover:shadow-md transition border">
          <div>
            <h3 className="font-semibold text-gray-800">View Orders</h3>
            <p className="text-gray-500 text-sm">Track and update orders</p>
          </div>
          <ShoppingCart className="text-gray-600" size={26} />
        </button>

        <button onClick={() => navigate("/users")} className="flex items-center justify-between bg-white p-4 rounded-xl shadow hover:shadow-md transition border">
          <div>
            <h3 className="font-semibold text-gray-800">User Management</h3>
            <p className="text-gray-500 text-sm">Invite or manage users</p>
          </div>
          <Users className="text-gray-600" size={26} />
        </button>

        <button onClick={() => navigate("/settings")} className="flex items-center justify-between bg-white p-4 rounded-xl shadow hover:shadow-md transition border">
          <div>
            <h3 className="font-semibold text-gray-800">Settings</h3>
            <p className="text-gray-500 text-sm">System & account settings</p>
          </div>
          <LayoutDashboard className="text-gray-600" size={26} />
        </button>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>

        <div className="space-y-3">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-700">New order #1245</span>
            <span className="text-gray-500 text-sm">2 hours ago</span>
          </div>

          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-700">User John Doe registered</span>
            <span className="text-gray-500 text-sm">5 hours ago</span>
          </div>

          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-700">Product “Nike Air Max” added</span>
            <span className="text-gray-500 text-sm">1 day ago</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Alerts</h2>

        <div className="text-red-600">3 products are low on stock</div>
        <div className="text-yellow-600">2 orders pending approval</div>
      </div>

      {/* Tasks */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-4">Tasks</h3>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4" />
            <span>Review 3 new orders</span>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4" />
            <span>Add missing product images</span>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4" />
            <span>Check low stock items</span>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-3">AI Insights</h3>

        <ul className="space-y-2 text-sm">
          <li>• Revenue is up by 12% compared to last week.</li>
          <li>• 3 products are trending in the last 48 hours.</li>
          <li>• User growth is stable with a slight upward trend.</li>
          <li>• Inventory risk detected: 2 items may go out of stock soon.</li>
        </ul>
      </div>
    </div>
  );
}