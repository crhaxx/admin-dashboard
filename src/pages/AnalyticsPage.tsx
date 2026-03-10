import { useEffect } from "react";
import Chart from "chart.js/auto";
import { useOrders } from "../providers/OrdersProvider";
import { useProducts } from "../providers/ProductsProvider";
import { useUsers } from "../providers/UsersProvider";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  Users as UsersIcon,
} from "lucide-react";

export default function AnalyticsPage() {
  const { orders } = useOrders();
  const { products } = useProducts();
  const { users } = useUsers();

  // ---- KPI LOGIC ----
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const totalUsers = users.length;
  const returningCustomers = users.filter((u: any) => u.ordersCount && u.ordersCount > 1).length;

  const kpis = [
    { label: "Total Revenue", value: `${totalRevenue.toLocaleString('cs-CZ')} CZK`, color: "text-green-600" },
    { label: "Total Orders", value: totalOrders, color: "text-blue-600" },
    { label: "Avg Order Value", value: `${avgOrderValue.toLocaleString('cs-CZ')} CZK`, color: "text-purple-600" },
    { label: "Total Users", value: totalUsers, color: "text-indigo-600" },
    { label: "Returning Customers", value: returningCustomers, color: "text-orange-600" },
  ];

  // ---- REVENUE LAST 30 DAYS ----
  const now = new Date();
  const labels30 = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });

  const revenue30 = Array(30).fill(0);
  orders.forEach(o => {
    if (!o.createdAt?.seconds) return;
    const date = new Date(o.createdAt.seconds * 1000);
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (diffDays >= 0 && diffDays < 30) {
      const index = 29 - diffDays;
      revenue30[index] += o.total;
    }
  });

  // ---- ORDERS BREAKDOWN ----
  const statusCounts = {
    pending: orders.filter(o => o.status === "pending").length,
    paid: orders.filter(o => o.status === "paid").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  };

  // ---- TOP PRODUCTS ----
const productSales: Record<string, number> = {};

orders.forEach((o: any) => {
  if (!o.items) return;

  o.items.forEach((item: any) => {
    const productId = item.productId; // ← TADY JE TEN KLÍČ

    if (!productId) return;

    if (!productSales[productId]) productSales[productId] = 0;
    productSales[productId] += item.price * item.qty;
  });
});

const topProducts = Object.entries(productSales)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([id, revenue]) => {
    const product = products.find((p: any) => p.id === id);

    return {
      id,
      name: product?.name || "(Unknown product)",
      revenue,
    };
  });

  // ---- USER GROWTH ----
  const usersByDay: Record<string, number> = {};
  users.forEach((u: any) => {
    if (!u.createdAt?.seconds) return;
    const d = new Date(u.createdAt.seconds * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    usersByDay[d] = (usersByDay[d] || 0) + 1;
  });
  const userGrowthLabels = Object.keys(usersByDay);
  const userGrowthData = Object.values(usersByDay);

  // ---- INVENTORY ----
  const lowStock = products.filter((p: any) => p.stock !== undefined && p.stock < 5 && p.stock > 0);
  const outOfStock = products.filter((p: any) => p.stock === 0);
  const mostStocked = [...products]
    .filter((p: any) => typeof p.stock === "number")
    .sort((a: any, b: any) => b.stock - a.stock)
    .slice(0, 5);

  // ---- AI INSIGHTS ----
  const last7 = orders.filter(o => o.createdAt?.seconds > Date.now() / 1000 - 7 * 86400);
  const prev7 = orders.filter(
    o =>
      o.createdAt?.seconds > Date.now() / 1000 - 14 * 86400 &&
      o.createdAt?.seconds <= Date.now() / 1000 - 7 * 86400
  );

  const last7Revenue = last7.reduce((sum, o) => sum + o.total, 0);
  const prev7Revenue = prev7.reduce((sum, o) => sum + o.total, 0);

  const insights: { icon: React.ReactNode; text: string }[] = [];

  if (prev7Revenue > 0) {
    const diff = Math.round(((last7Revenue - prev7Revenue) / prev7Revenue) * 100);
    insights.push({
      icon:
        diff >= 0 ? (
          <TrendingUp className="w-5 h-5 text-green-300" />
        ) : (
          <TrendingDown className="w-5 h-5 text-red-300" />
        ),
      text: `Revenue is ${diff >= 0 ? "up" : "down"} by ${Math.abs(
        diff
      )}% compared to last week.`,
    });
  }

  const trendingProducts = orders
    .filter(o => o.createdAt?.seconds > Date.now() / 1000 - 48 * 3600)
    .map((o: any) => o.id);
  const trendingCount = new Set(trendingProducts).size;

  insights.push({
    icon: <BarChart3 className="w-5 h-5 text-yellow-300" />,
    text: `${trendingCount} products are trending in the last 48 hours.`,
  });

  const newUsers = users.filter(
    (u: any) => u.createdAt?.seconds > Date.now() / 1000 - 7 * 86400
  );
  insights.push({
    icon: <UsersIcon className="w-5 h-5 text-blue-300" />,
    text: `${newUsers.length} new users joined this week.`,
  });

  insights.push({
    icon: <AlertTriangle className="w-5 h-5 text-red-300" />,
    text: `Inventory risk detected: ${lowStock.length + outOfStock.length} items may go out of stock soon.`,
  });

  // ---- CHARTS RENDERING ----
  useEffect(() => {
    const revenueCanvas = document.getElementById("analyticsRevenueChart") as HTMLCanvasElement | null;
    const ordersCanvas = document.getElementById("analyticsOrdersChart") as HTMLCanvasElement | null;
    const usersCanvas = document.getElementById("analyticsUsersChart") as HTMLCanvasElement | null;

    if (!revenueCanvas || !ordersCanvas || !usersCanvas) return;

    if ((window as any).analyticsRevenueChart instanceof Chart)
      (window as any).analyticsRevenueChart.destroy();
    if ((window as any).analyticsOrdersChart instanceof Chart)
      (window as any).analyticsOrdersChart.destroy();
    if ((window as any).analyticsUsersChart instanceof Chart)
      (window as any).analyticsUsersChart.destroy();

    (window as any).analyticsRevenueChart = new Chart(revenueCanvas, {
      type: "line",
      data: {
        labels: labels30,
        datasets: [
          {
            label: "Revenue (last 30 days)",
            data: revenue30,
            borderColor: "#4f46e5",
            tension: 0.4,
          },
        ],
      },
    });

    (window as any).analyticsOrdersChart = new Chart(ordersCanvas, {
      type: "pie",
      data: {
        labels: ["Pending", "Paid", "Shipped", "Delivered", "Cancelled"],
        datasets: [
          {
            data: [
              statusCounts.pending,
              statusCounts.paid,
              statusCounts.shipped,
              statusCounts.delivered,
              statusCounts.cancelled,
            ],
            backgroundColor: ["#fbbf24", "#22c55e", "#3b82f6", "#6366f1", "#ef4444"],
          },
        ],
      },
    });

    (window as any).analyticsUsersChart = new Chart(usersCanvas, {
      type: "line",
      data: {
        labels: userGrowthLabels,
        datasets: [
          {
            label: "New users",
            data: userGrowthData,
            borderColor: "#22c55e",
            tension: 0.4,
          },
        ],
      },
    });
  }, [orders, products, users]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold text-black">
            Analytics
          </h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((k, i) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow">
            <div className="text-gray-500 text-sm">{k.label}</div>
            <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl shadow col-span-2">
          <h3 className="text-lg font-semibold mb-3">Revenue (Last 30 Days)</h3>
          <canvas id="analyticsRevenueChart" />
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-3">Orders Breakdown</h3>
          <canvas id="analyticsOrdersChart" />
        </div>
      </div>

      {/* User growth + Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-3">User Growth</h3>
          <canvas id="analyticsUsersChart" />
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-3">Inventory Overview</h3>

          <div className="space-y-3 text-sm">
            <div>Low stock items: <span className="font-semibold">{lowStock.length}</span></div>
            <div>Out of stock items: <span className="font-semibold">{outOfStock.length}</span></div>

            <div className="mt-3">
              <div className="font-semibold mb-1">Most stocked products</div>
              <ul className="space-y-1">
                {mostStocked.map((p: any) => (
                  <li key={p.id} className="flex justify-between">
                    <span>{p.name}</span>
                    <span className="text-gray-500 text-sm">Stock: {p.stock}</span>
                  </li>
                ))}
                {mostStocked.length === 0 && (
                  <li className="text-gray-400 text-sm">No products</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Top products */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-3">Top Selling Products</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Product</th>
              <th className="py-2">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map(p => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="py-2">{p.name}</td>
                <td className="py-2">{p.revenue.toLocaleString('cs-CZ')} CZK</td>
              </tr>
            ))}
            {topProducts.length === 0 && (
              <tr>
                <td colSpan={2} className="py-2 text-gray-400">
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
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