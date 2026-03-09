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
  Info,
  Trash,
  Pencil,
  XCircle,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  ImageOff,
  UsersIcon,
  BarChart3,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import Chart from "chart.js/auto";
import { useOrders } from "../providers/OrdersProvider";
import { useUsers } from "../providers/UsersProvider";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

export default function DashboardPage() {
  const { products } = useProducts();
const { orders } = useOrders();
const { users } = useUsers();

const [filter, setFilter] = useState("Last 7 days");

type Order = {
  id: string;
  status: string;
  total: number;
  createdAt?: { seconds: number };
  paidAt?: { seconds: number };
  shippedAt?: { seconds: number };
  deliveredAt?: { seconds: number };
};

const filterOrdersByRange = (orders: Order[], filter: string) => {
  const now = new Date();

  return orders.filter(order => {
    if (!order.createdAt?.seconds) return false;
    const date = new Date(order.createdAt.seconds * 1000);

    if (filter === "Today") {
      return date.toDateString() === now.toDateString();
    }

    if (filter === "Last 7 days") {
      return now.getTime() - date.getTime() <= 7 * 24 * 60 * 60 * 1000;
    }

    if (filter === "Last 30 days") {
      return now.getTime() - date.getTime() <= 30 * 24 * 60 * 60 * 1000;
    }

    return true; // All time
  });
};

useEffect(() => {
  if (!orders.length) return;

  const now = new Date();

  const filtered = filterOrdersByRange(orders, filter);

  const baseDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const jsDay = now.getDay();
  const todayIndex = jsDay === 0 ? 6 : jsDay - 1;

  // FIX: rotateArray musí být až po todayIndex
  const rotateArray = (arr: number[]): number[] =>
    [...arr.slice(todayIndex + 1), ...arr.slice(0, todayIndex + 1)];

  const rotatedDays =
    filter === "Last 7 days"
      ? [...baseDays.slice(todayIndex + 1), ...baseDays.slice(0, todayIndex + 1)]
      : baseDays;

  let revenueByDay = Array(7).fill(0);
  let ordersByDay = Array(7).fill(0);

  orders.forEach(order => {
    if (!order.createdAt?.seconds) return;

    const date = new Date(order.createdAt.seconds * 1000);
    const dayIndex = date.getDay();
    const correctedIndex = dayIndex === 0 ? 6 : dayIndex - 1;

    ordersByDay[correctedIndex]++;
    if (["paid", "shipped", "delivered"].includes(order.status)) {
      revenueByDay[correctedIndex] += order.total;
    }
  });

  let finalRevenue: number[] = [];
  let finalOrders: number[] = [];
  let labels: string[] = [];

  if (filter === "Last 7 days") {
    labels = rotatedDays;
    finalRevenue = rotateArray(revenueByDay);
    finalOrders = rotateArray(ordersByDay);
  }

  if (filter === "Today") {
    labels = Array.from({ length: 24 }).map((_, i) => `${i}:00`);

    const revenueHours = Array(24).fill(0);
    const ordersHours = Array(24).fill(0);

    filtered.forEach(order => {
      if (!order.createdAt?.seconds) return;

      const date = new Date(order.createdAt.seconds * 1000);
      if (date.toDateString() !== now.toDateString()) return;

      const hour = date.getHours();
      ordersHours[hour]++;
      if (["paid", "shipped", "delivered"].includes(order.status)) {
        revenueHours[hour] += order.total;
      }
    });

    finalRevenue = revenueHours;
    finalOrders = ordersHours;
  }

  if (filter === "Last 30 days") {
    labels = Array.from({ length: 30 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    });

    const revenue30 = Array(30).fill(0);
    const orders30 = Array(30).fill(0);

    filtered.forEach(order => {
      if (!order.createdAt?.seconds) return;

      const date = new Date(order.createdAt.seconds * 1000);
      const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

      if (diffDays >= 0 && diffDays < 30) {
        const index = 29 - diffDays;
        orders30[index]++;
        if (["paid", "shipped", "delivered"].includes(order.status)) {
          revenue30[index] += order.total;
        }
      }
    });

    finalRevenue = revenue30;
    finalOrders = orders30;
  }

  if (filter === "All time") {
  const timestamps = filtered
    .map(o => o.createdAt?.seconds)
    .filter(Boolean) as number[];

  if (timestamps.length > 0) {
    const first = new Date(Math.min(...timestamps) * 1000);

    const diffDays = Math.floor((now.getTime() - first.getTime()) / 86400000);

    labels = Array.from({ length: diffDays + 1 }).map((_, i) => {
      const d = new Date(Date.UTC(
        first.getUTCFullYear(),
        first.getUTCMonth(),
        first.getUTCDate() + i
      ));
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    });

    const revenueAll = Array(diffDays + 1).fill(0);
    const ordersAll = Array(diffDays + 1).fill(0);

    orders.forEach(order => {
      if (!order.createdAt?.seconds) return;

      const raw = new Date(order.createdAt.seconds * 1000);
      const date = new Date(Date.UTC(
        raw.getUTCFullYear(),
        raw.getUTCMonth(),
        raw.getUTCDate()
      ));

      const index = Math.floor((date.getTime() - Date.UTC(
        first.getUTCFullYear(),
        first.getUTCMonth(),
        first.getUTCDate()
      )) / 86400000);

      if (index >= 0 && index < revenueAll.length) {
        ordersAll[index]++;
        if (["paid", "shipped", "delivered"].includes(order.status)) {
          revenueAll[index] += order.total;
        }
      }
    });

    finalRevenue = revenueAll;
    finalOrders = ordersAll;
  }
}

  if (labels.length === 0) {
    labels = ["No data"];
    finalRevenue = [0];
    finalOrders = [0];
  }

  const revenueCanvas = document.getElementById("revenueChart") as HTMLCanvasElement | null;
  const ordersCanvas = document.getElementById("ordersChart") as HTMLCanvasElement | null;

  if (!revenueCanvas || !ordersCanvas) return;

  if ((window as any).revenueChart instanceof Chart)
    (window as any).revenueChart.destroy();

  if ((window as any).ordersChart instanceof Chart)
    (window as any).ordersChart.destroy();

  (window as any).revenueChart = new Chart(revenueCanvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Revenue",
          data: finalRevenue,
          borderColor: "#4f46e5",
          tension: 0.4,
        },
      ],
    },
  });

  (window as any).ordersChart = new Chart(ordersCanvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Orders",
          data: finalOrders,
          backgroundColor: "#10b981",
        },
      ],
    },
  });
}, [orders, filter]);

const [activity, setActivity] = useState<any[]>([]);

useEffect(() => {
  const q = query(
    collection(db, "activity"),
    orderBy("timestamp", "desc"),
    limit(3)
  );

  const unsub = onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setActivity(logs);
  });

  return () => unsub();
}, []);

const tasks = [];

// 1) Review new orders
const pendingOrdersTask = orders.filter(o => o.status === "pending");
tasks.push({
  text: `Review ${pendingOrdersTask.length} new orders`,
  icon: <ShoppingCart className="w-5 h-5 text-blue-600" />,
  completed: pendingOrdersTask.length === 0
});


// 2) Missing product images
const missingImages = products.filter(p => !p.images![0] || p.images![0] === "");
tasks.push({
  text: `Add ${missingImages.length} missing product images`,
  icon: <ImageOff className="w-5 h-5 text-purple-600" />,
  completed: missingImages.length === 0
});


// 3) Low stock items
const lowStockItem = products.filter(p => p.stock !== undefined && p.stock < 5);
tasks.push({
  text: `Check ${lowStockItem.length} low stock items`,
  icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
  completed: lowStockItem.length === 0
});

const getIconForAction = (action: string) => {
  const lower = action.toLowerCase();

  if (lower.includes("order")) return <ShoppingCart className="w-5 h-5 text-blue-500" />;
  if (lower.includes("user")) return <UserPlus className="w-5 h-5 text-green-500" />;
  if (lower.includes("product")) return <Package className="w-5 h-5 text-purple-500" />;
  return <Info className="w-5 h-5 text-gray-400" />; // fallback
};

const timeAgo = (ms: number) => {
  const now = Date.now();
  const diff = now - ms;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
};

const [openActions, setOpenActions] = useState(false);
const navigate = useNavigate();

const getAlertIcon = (text: string) => {
  const lower = text.toLowerCase();

  if (lower.includes("out of stock"))
    return <XCircle className="w-5 h-5 text-red-600" />;

  if (lower.includes("low on stock"))
    return <AlertTriangle className="w-5 h-5 text-yellow-600" />;

  if (lower.includes("pending"))
    return <AlertCircle className="w-5 h-5 text-blue-600" />;

  return <CheckCircle className="w-5 h-5 text-green-600" />; // fallback
};

const alerts: { text: string; color: string }[] = [];

// Low stock (např. < 5)
const lowStock = products.filter(p => p.stock !== undefined && p.stock > 0 && p.stock < 5);
if (lowStock.length > 0) {
  alerts.push({
    text: `${lowStock.length} products are low on stock`,
    color: "text-yellow-600"
  });
}

// Out of stock
const outOfStock = products.filter(p => p.stock !== undefined && p.stock === 0);
if (outOfStock.length > 0) {
  alerts.push({
    text: `${outOfStock.length} products are out of stock`,
    color: "text-red-600"
  });
}

// Pending orders
const pendingOrders = orders.filter(o => o.status === "pending");
if (pendingOrders.length > 0) {
  alerts.push({
    text: `${pendingOrders.length} orders pending approval`,
    color: "text-blue-600"
  });
}

const revenueStatuses = ["paid", "shipped", "delivered"];

const totalRevenue = orders
  .filter(o => revenueStatuses.includes(o.status))
  .reduce((sum, o) => sum + o.total, 0);

  const insights = [];

// Revenue trend (posledních 7 dní vs předchozích 7 dní)
const last7 = orders.filter(o => o.createdAt?.seconds > Date.now()/1000 - 7*86400);
const prev7 = orders.filter(o => o.createdAt?.seconds > Date.now()/1000 - 14*86400 && o.createdAt?.seconds <= Date.now()/1000 - 7*86400);

const last7Revenue = last7.reduce((sum, o) => sum + o.total, 0);
const prev7Revenue = prev7.reduce((sum, o) => sum + o.total, 0);

if (prev7Revenue > 0) {
  const diff = Math.round(((last7Revenue - prev7Revenue) / prev7Revenue) * 100);
  insights.push({
    icon: diff >= 0
      ? <TrendingUp className="w-5 h-5 text-green-300" />
      : <TrendingDown className="w-5 h-5 text-red-300" />,
    text: `Revenue is ${diff >= 0 ? "up" : "down"} by ${Math.abs(diff)}% compared to last week.`
  });
}

// Trending products (posledních 48 hodin)
const trendingProducts = orders
  .filter(o => o.createdAt?.seconds > Date.now()/1000 - 48*3600)
  .map(o => o.id);

const trendingCount = new Set(trendingProducts).size;

insights.push({
  icon: <BarChart3 className="w-5 h-5 text-yellow-300" />,
  text: `${trendingCount} products are trending in the last 48 hours.`
});

// User growth (posledních 7 dní)
const newUsers = users.filter((u:any) => u.createdAt?.seconds > Date.now()/1000 - 7*86400);
insights.push({
  icon: <UsersIcon className="w-5 h-5 text-blue-300" />,
  text: `${newUsers.length} new users joined this week.`
});

// Inventory risk
const lowStockofItems = products.filter(p => p.stock !== undefined && p.stock < 5);
insights.push({
  icon: <AlertTriangle className="w-5 h-5 text-red-300" />,
  text: `Inventory risk detected: ${lowStockofItems.length} items may go out of stock soon.`
});


  return (

    
    <div className="min-h-screen bg-gray-100 dark:bg-[#0d0d0d] p-6 space-y-10">

  {/* Quick Actions */}
  <div className="flex justify-end">
    <div className="relative">
      <button
        onClick={() => setOpenActions((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-[#fffffff] dark:hover:bg-[#cccccc] rounded-lg transition"
      >
        <Plus size={18} />
        <span>Create</span>
      </button>

      {openActions && (
        <div className="absolute right-0 mt-2 bg-white dark:bg-[#ffffff] border border-gray-200 dark:border-[#333] rounded-lg shadow-lg w-44 z-20">
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#cccccc] flex items-center gap-2">
            <Plus size={16} /> Add Product
          </button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#cccccc] flex items-center gap-2">
            <ShoppingCart size={16} /> Create Order
          </button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#cccccc] flex items-center gap-2">
            <UserPlus size={16} /> Invite User
          </button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#cccccc] flex items-center gap-2">
            <Package size={16} /> Add Inventory
          </button>
        </div>
      )}
    </div>
</div>


      {/* Dashboard Filters */}
      <div className="flex justify-end gap-2">
  {["Today", "Last 7 days", "Last 30 days", "All time"].map((label) => (
    <button
      key={label}
      onClick={() => setFilter(label)}
      className={`px-3 py-1.5 rounded-lg text-sm transition
        ${filter === label ? "bg-indigo-600 text-white" : "bg-gray-200 hover:bg-gray-300"}
      `}
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
              <h2 className="text-2xl font-bold mt-1">{orders.length}</h2>
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
              <h2 className="text-2xl font-bold mt-1">${totalRevenue.toFixed(2)}</h2>
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
              <h2 className="text-2xl font-bold mt-1">{users.length}</h2>
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
    {activity.map((item) => (
      <div
        key={item.id}
        className="flex justify-between items-center border-b pb-2"
      >
        <div className="flex items-center gap-2">
          {getIconForAction(item.action)}
          <span className="text-gray-700">{item.userName}: {item.action}</span>
        </div>

        <span className="text-gray-500 text-sm">
          {timeAgo(item.timestamp)}
        </span>
      </div>
    ))}

    {activity.length === 0 && (
      <div className="text-gray-500 text-sm">No recent activity</div>
    )}
  </div>
</div>

      {/* Alerts */}
<div className="bg-white p-5 rounded-xl shadow">
  <h2 className="text-xl font-semibold mb-4">Alerts</h2>

  <div className="space-y-3">
    {alerts.length > 0 ? (
      alerts.map((a, i) => (
        <div key={i} className="flex items-center gap-2 border-b pb-2">
          {getAlertIcon(a.text)}
          <span className={a.color}>{a.text}</span>
        </div>
      ))
    ) : (
      <div className="text-gray-500 text-sm">No alerts</div>
    )}
  </div>
</div>

      {/* Tasks */}
<div className="bg-white p-5 rounded-xl shadow">
  <h3 className="text-xl font-semibold mb-4">Tasks</h3>

  <div className="space-y-3">
    {tasks.map((task, i) => (
      <div key={i} className="flex items-center gap-3">
        <input
          type="checkbox"
          className="w-4 h-4"
          disabled
          checked={task.completed}
        />

        <div className="flex items-center gap-2">
          {task.icon}
          <span className={task.completed ? "text-green-600 font-medium" : "text-gray-700"}>
            {task.text}
          </span>
        </div>
      </div>
    ))}
  </div>
</div>

      {/* AI Insights */}
<div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 rounded-xl shadow">
  <h3 className="text-xl font-semibold mb-3">AI Insights</h3>

  <ul className="space-y-3 text-sm">
    {insights.map((i, index) => (
      <li key={index} className="flex items-center gap-2">
        {i.icon}
        <span>{i.text}</span>
      </li>
    ))}
  </ul>
</div>
    </div>
  );
}