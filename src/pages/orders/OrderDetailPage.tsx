import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp, collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useEffect, useState } from "react";
import { Loader2, Clock, CheckCircle, Truck, PackageCheck } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useAuth } from "../../providers/AuthProvider";
import { useProducts } from "../../providers/ProductsProvider";

/* ---------------------------------------------------
   TIMELINE COMPONENT
--------------------------------------------------- */
const Timeline = ({ order }: { order: any }) => {
  const steps = [
    { key: "created", label: "Created", icon: <Clock size={18} /> },
    { key: "pending", label: "Pending", icon: <Loader2 size={18} /> },
    { key: "paid", label: "Paid", icon: <CheckCircle size={18} /> },
    { key: "shipped", label: "Shipped", icon: <Truck size={18} /> },
    { key: "delivered", label: "Delivered", icon: <PackageCheck size={18} /> },
  ];

  const statusOrder = ["created", "pending", "paid", "shipped", "delivered"];
  const currentIndex = statusOrder.indexOf(order.status);

  const getDate = (key: string) => {
    const field = key + "At";
    if (!order[field]?.seconds) return null;
    return format(order[field].toDate(), "dd.MM.yyyy HH:mm");
  };

  return (
    <div className="flex items-center mt-8 mb-8">
      {steps.map((step, index) => {
        const isActive = index <= currentIndex;
        const date = getDate(step.key);

        return (
          <div key={step.key} className="flex items-center flex-1">
            {/* ICON */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${isActive ? "bg-indigo-600 text-white" : "bg-gray-300 dark:bg-[#333] text-gray-600"}
                `}
              >
                {step.icon}
              </div>

              <p
                className={`mt-2 text-sm font-medium ${
                  isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500"
                }`}
              >
                {step.label}
              </p>

              {/* ALWAYS SHOW DATE IF EXISTS */}
              {date && (
                <p className="text-xs text-gray-500 mt-1">
                  {date}
                </p>
              )}
            </div>

            {/* LINE BETWEEN STEPS */}
            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-1 mx-3
                  ${index < currentIndex ? "bg-indigo-600" : "bg-gray-300 dark:bg-[#333]"}
                `}
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ---------------------------------------------------
   MAIN PAGE
--------------------------------------------------- */
export default function OrderDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { products } = useProducts();

  const { user } = useAuth();

  /* ---------------- PDF EXPORT ---------------- */
  const exportPDF = async () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Order #${order.id}`, 14, 20);

    doc.setFontSize(12);
    doc.text(`Customer: ${order.customerName}`, 14, 30);
    doc.text(`Status: ${order.status}`, 14, 38);
    doc.text(
      `Created: ${
        order.createdAt?.seconds
          ? format(order.createdAt.toDate(), "dd.MM.yyyy HH:mm")
          : "—"
      }`,
      14,
      46
    );

    doc.text(`Tracking Number: ${order.trackingNumber || "-"}`, 14, 58);
    doc.text(`Carrier: ${order.shippingCarrier || "-"}`, 14, 66);
    doc.text(`Note: ${order.shippingNote || "-"}`, 14, 74);

    autoTable(doc, {
      startY: 90,
      head: [["Product", "Qty", "Price", "Subtotal"]],
      body: order.items.map((item: any) => [
        item.name,
        item.qty,
        `$${item.price.toFixed(2)}`,
        `$${(item.qty * item.price).toFixed(2)}`,
      ]),
    });

    await addDoc(collection(db, "activity"), {
        userName: user.firstName + " " + user.lastName,
        userId: user.uid,
        action: "Exported order " + order.id + " to pdf",
        timestamp: Date.now(),
      });

    doc.save(`order_${order.id}.pdf`);
  };

  /* ---------------- FETCH ORDER ---------------- */
  useEffect(() => {
    async function fetchOrder() {
      const ref = doc(db, "orders", id!);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() });
      }

      setLoading(false);
    }

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 text-center dark:text-gray-500">
        Order not found
      </div>
    );
  }

  /* ---------------- TRACKING URL ---------------- */
  const getTrackingUrl = () => {
    if (!order.trackingNumber || !order.shippingCarrier) return null;

    const carrier = order.shippingCarrier.toLowerCase();
    const tn = order.trackingNumber;

    if (carrier.includes("ppl"))
      return `https://www.ppl.cz/vyhledat-zasilku?shipmentId=${tn}`;

    if (carrier.includes("dpd"))
      return `https://tracking.dpd.de/status/en_US/parcel/${tn}`;

    if (carrier.includes("gls"))
      return `https://gls-group.eu/CZ/cs/sledovani-zasilek?match=${tn}`;

    if (carrier.includes("zasilkovna") || carrier.includes("packeta"))
      return `https://tracking.packeta.com/cs/tracking/search?trackingNumber=${tn}`;

    if (carrier.includes("posta") || carrier.includes("ceska posta"))
      return `https://www.postaonline.cz/trackandtrace/-/zasilka/cislo?parcelNumbers=${tn}`;

    return null;
  };

  const trackingUrl = getTrackingUrl();

  /* ---------------- UPDATE SHIPPING ---------------- */
  const updateShipping = async (field: string, value: string) => {
    try {
      await updateDoc(doc(db, "orders", order.id), {
        [field]: value,
      });

      setOrder((prev: any) => ({ ...prev, [field]: value }));
      await addDoc(collection(db, "activity"), {
        userName: user.firstName + " " + user.lastName,
        userId: user.uid,
        action: "Updated order " + order.id + " shipping details",
        timestamp: Date.now(),
      });
      toast.success("Shipping info updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update shipping info");
    }
  };

  /* ---------------- UPDATE STATUS + TIMESTAMPS ---------------- */
  const updateStatus = async (newStatus: string) => {
    try {
      const updates: any = { status: newStatus };

      if (newStatus === "paid") updates.paidAt = serverTimestamp();
      if (newStatus === "shipped") updates.shippedAt = serverTimestamp();
      if (newStatus === "delivered") updates.deliveredAt = serverTimestamp();

      await updateDoc(doc(db, "orders", order.id), updates);

      const freshSnap = await getDoc(doc(db, "orders", order.id));
      setOrder({ id: order.id, ...freshSnap.data() });

    //   setOrder((prev: any) => ({ ...prev, ...updates }));

      await addDoc(collection(db, "activity"), {
        userName: user.firstName + " " + user.lastName,
        userId: user.uid,
        action: "Updated order " + order.id + " status to: " + newStatus,
        timestamp: Date.now(),
      });
      toast.success("Status updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  /* ---------------- DELETE ORDER ---------------- */
  const deleteOrder = async () => {
    if (!confirm("Do you really want to delete this order?")) return;

    try {
     await deleteDoc(doc(db, "orders", order.id));
     
      await addDoc(collection(db, "activity"), {
        userName: user.firstName + " " + user.lastName,
        userId: user.uid,
        action: "Deleted order: " + order.id,
        timestamp: Date.now(),
      });

      toast.success("Order deleted");
      navigate("/orders");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete order");
    }
  };

  /* ---------------------------------------------------
     RENDER
  --------------------------------------------------- */
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate("/orders")}
          className="px-4 py-2 bg-gray-200 dark:bg-[#333] text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-[#444] transition"
        >
          ← Back to Orders
        </button>

        <button
          onClick={deleteOrder}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Delete Order
        </button>

        <button
          onClick={exportPDF}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Export PDF
        </button>
      </div>

      <h1 className="text-2xl font-semibold mb-4 text-white">Order #{order.id}</h1>

      {/* Order Info */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow border border-gray-200 dark:border-[#333] p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-white">Order Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Customer</p>
            <p className="font-medium text-white">{order.customerName}</p>
          </div>

          <div>
            <p className="text-gray-500">Total</p>
            <p className="font-medium text-white">${order.total.toFixed(2)}</p>
          </div>

          <div>
            <p className="text-gray-500">Status</p>

            <select
              value={order.status}
              onChange={(e) => updateStatus(e.target.value)}
              className="
                mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-[#444]
                bg-white text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500
                transition
              "
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          <div>
            <p className="text-gray-500">Created</p>
            <p className="font-medium text-white">
              {order.createdAt?.seconds
                ? format(order.createdAt.toDate(), "dd.MM.yyyy HH:mm")
                : "—"}
            </p>
          </div>
        </div>

        {/* TIMELINE */}
        <Timeline order={order} />

        {/* Shipping Info */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow border border-gray-200 dark:border-[#333] p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Shipping Info</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Tracking Number</p>
              <input
                type="text"
                defaultValue={order.trackingNumber || ""}
                onBlur={(e) => updateShipping("trackingNumber", e.target.value)}
                placeholder="Enter tracking number"
                className="mt-1 w-full px-3 py-2 text-white rounded-lg border border-gray-300 dark:border-[#444] bg-white dark:bg-[#222] focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <p className="text-gray-500">Carrier</p>
              <input
                type="text"
                defaultValue={order.shippingCarrier || ""}
                onBlur={(e) => updateShipping("shippingCarrier", e.target.value)}
                placeholder="e.g. PPL, DPD, GLS"
                className="mt-1 w-full px-3 py-2 text-white rounded-lg border border-gray-300 dark:border-[#444] bg-white dark:bg-[#222] focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <p className="text-gray-500">Shipping Note</p>
              <textarea
                defaultValue={order.shippingNote || ""}
                onBlur={(e) => updateShipping("shippingNote", e.target.value)}
                placeholder="Optional note for courier"
                className="mt-1 w-full px-3 py-2 text-white rounded-lg border border-gray-300 dark:border-[#444] bg-white dark:bg-[#222] focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {trackingUrl && (
              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline text-sm"
              >
                Open Tracking Link →
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow border border-gray-200 dark:border-[#333] p-6">
        <h2 className="text-lg font-semibold mb-4 text-white">Items</h2>

        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-[#111] text-gray-600 dark:text-gray-300">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Price</th>
              <th className="p-3">Subtotal</th>
            </tr>
          </thead>

          <tbody>
  {order.items?.map((item: any, i: number) => {
    const product = products.find(p => p.id === item.productId);

    return (
      <tr
        key={i}
        className="border-t border-gray-200 dark:border-[#333] hover:bg-gray-50 dark:hover:bg-[#222] transition"
      >
        <td className="p-3 font-medium text-white flex items-center gap-3">
          <img
            src={item?.images?.[0] || "/placeholder.png"}
            alt={item.name}
            className="w-12 h-12 rounded-lg object-cover border border-[#333]"
          />
          {item.name}
        </td>

        <td className="p-3 text-white">{item.qty}</td>
        <td className="p-3 text-white">${item.price.toFixed(2)}</td>
        <td className="p-3 font-semibold text-white">
          ${(item.qty * item.price).toFixed(2)}
        </td>
      </tr>
    );
  })}
</tbody>
        </table>

        {order.items?.length === 0 && (
          <div className="p-4 text-center text-gray-500">No items</div>
        )}
      </div>
    </div>
  );
}