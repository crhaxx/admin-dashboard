import { useOrders } from "../../providers/OrdersProvider";
import { format } from "date-fns";
import { ArrowRight, Loader2 } from "lucide-react";
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";

import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../../providers/ProductsProvider";
import { useUsers } from "../../providers/UsersProvider";



export default function OrdersPage() {
  const navigate = useNavigate();
  const { orders, loading } = useOrders();
  const { products } = useProducts();
  const { users } = useUsers();

  const addTestOrder = async () => {
  try {
    const availableProducts = products.filter((p: any) => p.stock > 0);

    if (availableProducts.length === 0) {
      toast.error("No products with stock available");
      return;
    }

    if (!Array.isArray(users) || users.length === 0) {
  toast.error("No users available");
  return;
}

if (!Array.isArray(products) || products.length === 0) {
  toast.error("No products available");
  return;
}

    const randomUserDoc = users[Math.floor(Math.random() * users.length)];
const randomUser = {
  ...randomUserDoc,
  uid: randomUserDoc.id,
};


    const itemCount = Math.min(
      Math.floor(Math.random() * 3) + 1,
      5
    );

    const shuffled = [...availableProducts].sort(() => Math.random() - 0.5);
    const selectedProducts = shuffled.slice(0, itemCount);

    const items = selectedProducts.map((product: any) => {
      const qty = Math.floor(Math.random() * Math.min(product.stock, 5)) + 1;

      return {
        productId: product.id,
        name: product.name,
        qty,
        price: product.price,
        images: product.images || [],
      };
    });

    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

    await addDoc(collection(db, "orders"), {
      customerName: randomUser.firstName + " " + randomUser.lastName,
      userId: randomUser.uid,
      total,
      status: "pending",
      createdAt: serverTimestamp(),
      items,
    });

    for (const item of items) {
      const product = products.find((p: any) => p.id === item.productId);
      if (!product) continue;

      const productRef = doc(db, "products", product.id);
      await updateDoc(productRef, {
        stock: product.stock - item.qty,
        updatedAt: serverTimestamp(),
      });
    }

    await addDoc(collection(db, "activity"), {
      userName: randomUser.firstName + " " + randomUser.lastName,
      userId: randomUser.uid,
      action: `Created test order with ${items.length} items`,
      timestamp: Date.now(),
    });

    toast.success("Test order created");
  } catch (err) {
    console.error(err);
    toast.error("Failed to create order");
  }
};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold text-black mb-4">Orders</h1>

      <button
  onClick={addTestOrder}
  className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow"
>
  Add Test Order
</button>

      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
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
                className="border-t border-gray-200 hover:bg-gray-100 transition"
              >
                <td className="p-4 font-medium text-black">{order.customerName}</td>

                <td className="p-4 text-black">{order.total.toLocaleString('cs-CZ')} CZK</td>

                <td className="p-4 text-black">
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

                <td className="p-4 text-gray-500">
                  {order.createdAt?.seconds
                    ? format(order.createdAt.toDate(), "dd.MM.yyyy HH:mm")
                    : "—"}
                </td>

                <td className="p-4">
  <button
    onClick={() => navigate(`/order/${order.id}`)}
    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
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