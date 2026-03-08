import { useOrders } from "../../providers/OrdersProvider";
import { format } from "date-fns";
import { ArrowRight, Loader2 } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";


const addTestOrder = async () => {
  try {
    await addDoc(collection(db, "orders"), {
      customerName: "Test User",
      total: 49.99,
      status: "pending",
      createdAt: serverTimestamp(),
      items: [
        {
          productId: "test123",
          name: "Test Product",
          qty: 1,
          price: 49.99,
        },
      ],
    });

    toast.success("Test order created");
  } catch (err) {
    console.error(err);
    toast.error("Failed to create order");
  }
};



export default function OrdersPage() {
  const navigate = useNavigate();
  const { orders, loading } = useOrders();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 text-white">Orders</h1>

      <button
  onClick={addTestOrder}
  className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow"
>
  Add Test Order
</button>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow border border-gray-200 dark:border-[#333] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-[#111] text-gray-600 dark:text-gray-300 text-sm">
            <tr>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-t border-gray-200 dark:border-[#333] hover:bg-gray-50 dark:hover:bg-[#222] transition"
              >
                <td className="p-4 font-medium dark:text-white">{order.customerName}</td>

                <td className="p-4 dark:text-white">${order.total.toFixed(2)}</td>

                <td className="p-4 dark:text-white">
                  <span
                    className={`
                      px-3 py-1 rounded-full text-xs font-semibold
                      ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : order.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : order.status === "shipped"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }
                    `}
                  >
                    {order.status}
                  </span>
                </td>

                <td className="p-4 text-gray-500 dark:text-white">
                  {order.createdAt?.seconds
                    ? format(order.createdAt.toDate(), "dd.MM.yyyy HH:mm")
                    : "—"}
                </td>

                <td className="p-4">
  <button
    onClick={() => navigate(`/order/${order.id}`)}
    className="p-2 rounded-lg bg-gray-100 dark:bg-[#222] hover:bg-gray-200 dark:hover:bg-[#333] transition"
  >
    <ArrowRight size={18} className="text-indigo-600" />
  </button>
</td>
              </tr>
            ))}
          </tbody>

          
        </table>

        {orders.length === 0 && (
          <div className="p-6 text-center text-gray-500">No orders yet</div>
        )}
      </div>
    </div>
  );
}