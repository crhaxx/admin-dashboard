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
import PriceInCurrency from "../../components/PriceInCurrency";

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

  const getTimestamp = (key: string) => {
    const field = order[key + "At"];
    return field?.seconds ? format(field.toDate(), "dd.MM.yyyy HH:mm") : null;
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-start gap-2 md:gap-4">

        {steps.map((step, i) => {
  const timestamp = getTimestamp(step.key);

  const isActive =
    timestamp ||
    (step.key === "pending" && ["pending", "paid", "shipped", "delivered"].includes(order.status)) ||
    (step.key === "paid" && ["paid", "shipped", "delivered"].includes(order.status)) ||
    (step.key === "shipped" && ["shipped", "delivered"].includes(order.status)) ||
    (step.key === "delivered" && order.status === "delivered");

  return (
    <div key={i} className="flex flex-col items-center text-center flex-1">
      <div
        className={`
          w-10 h-10 flex items-center justify-center rounded-full border
          ${isActive ? "bg-indigo-600 text-white border-indigo-600" : "bg-gray-200 text-gray-500 border-gray-300"}
        `}
      >
        {step.icon}
      </div>

      <p className="mt-2 text-sm font-medium text-black">{step.label}</p>

      <p className="text-xs text-gray-500 h-[16px] mt-1">
        {timestamp || ""}
      </p>
    </div>
  );
})}
      </div>

      {/* LINE */}
      <div className="mt-4 w-full h-[2px] bg-gray-200 relative">
        <div
          className="absolute top-0 left-0 h-full bg-indigo-600 transition-all"
          style={{
            width:
              order.status === "pending"
                ? "20%"
                : order.status === "paid"
                ? "40%"
                : order.status === "shipped"
                ? "60%"
                : order.status === "delivered"
                ? "100%"
                : "0%",
          }}
        />
      </div>
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
  <div className="p-4 md:p-6">

    {/* ACTION BUTTONS */}
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <button
        onClick={() => navigate("/orders")}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
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

    <h1 className="text-2xl md:text-3xl font-semibold mb-4 text-black">
      Order #{order.id}
    </h1>

    {/* ORDER DETAILS */}
    <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4 text-black">Order Details</h2>

      {/* DESKTOP GRID */}
      <div className="hidden sm:grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Customer</p>
          <p className="font-medium text-black">{order.customerName}</p>
        </div>

        <div>
          <p className="text-gray-500">Total</p>
          <PriceInCurrency priceForCurrency={order.total} component="p" />
        </div>

        <div>
          <p className="text-gray-500">Status</p>
          <select
            value={order.status}
            onChange={(e) => updateStatus(e.target.value)}
            className="mt-1 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        <div>
          <p className="text-gray-500">Created</p>
          <p className="font-medium text-black">
            {order.createdAt?.seconds
              ? format(order.createdAt.toDate(), "dd.MM.yyyy HH:mm")
              : "—"}
          </p>
        </div>
      </div>

      {/* MOBILE CARDS */}
      <div className="sm:hidden flex flex-col gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-500">Customer</p>
          <p className="font-medium text-black">{order.customerName}</p>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-500">Total</p>
          <PriceInCurrency priceForCurrency={order.total} component="p" />
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-500">Status</p>
          <select
            value={order.status}
            onChange={(e) => updateStatus(e.target.value)}
            className="mt-1 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-500">Created</p>
          <p className="font-medium text-black">
            {order.createdAt?.seconds
              ? format(order.createdAt.toDate(), "dd.MM.yyyy HH:mm")
              : "—"}
          </p>
        </div>
      </div>

      {/* TIMELINE */}
      <Timeline order={order} />

      {/* SHIPPING INFO */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4 text-black">Shipping Info</h2>

        {/* DESKTOP GRID */}
        <div className="hidden sm:grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Tracking Number</p>
            <input
              type="text"
              defaultValue={order.trackingNumber || ""}
              onBlur={(e) => updateShipping("trackingNumber", e.target.value)}
              placeholder="Enter tracking number"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <p className="text-gray-500">Carrier</p>
            <input
              type="text"
              defaultValue={order.shippingCarrier || ""}
              onBlur={(e) => updateShipping("shippingCarrier", e.target.value)}
              placeholder="e.g. PPL, DPD, GLS"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="col-span-2">
            <p className="text-gray-500">Shipping Note</p>
            <textarea
              defaultValue={order.shippingNote || ""}
              onBlur={(e) => updateShipping("shippingNote", e.target.value)}
              placeholder="Optional note for courier"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {trackingUrl && (
            <a
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 underline text-sm"
            >
              Open Tracking Link →
            </a>
          )}
        </div>

        {/* MOBILE CARDS */}
        <div className="sm:hidden flex flex-col gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500">Tracking Number</p>
            <input
              type="text"
              defaultValue={order.trackingNumber || ""}
              onBlur={(e) => updateShipping("trackingNumber", e.target.value)}
              placeholder="Enter tracking number"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500">Carrier</p>
            <input
              type="text"
              defaultValue={order.shippingCarrier || ""}
              onBlur={(e) => updateShipping("shippingCarrier", e.target.value)}
              placeholder="e.g. PPL, DPD, GLS"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500">Shipping Note</p>
            <textarea
              defaultValue={order.shippingNote || ""}
              onBlur={(e) => updateShipping("shippingNote", e.target.value)}
              placeholder="Optional note for courier"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {trackingUrl && (
            <a
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 underline text-sm"
            >
              Open Tracking Link →
            </a>
          )}
        </div>
      </div>
    </div>

    {/* ITEMS SECTION */}
    <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">

      <h2 className="text-lg font-semibold mb-4 text-black">Items</h2>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Price</th>
              <th className="p-3">Subtotal</th>
            </tr>
          </thead>

          <tbody>
            {order.items?.map((item: any, i: number) => (
              <tr
                key={i}
                className="border-t border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="p-3 font-medium text-black flex items-center gap-3">
                  <img
                    src={item?.images?.[0] || "/placeholder.png"}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover border border-gray-300"
                  />
                  {item.name}
                </td>

                <td className="p-3 text-black">{item.qty}</td>

                <PriceInCurrency priceForCurrency={item.price} component="td p3" />

                <PriceInCurrency
                  priceForCurrency={item.qty * item.price}
                  component="td-semi"
                />
              </tr>
            ))}
          </tbody>
        </table>

        {order.items?.length === 0 && (
          <div className="p-4 text-center text-gray-500">No items</div>
        )}
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden flex flex-col gap-4">
        {order.items?.map((item: any, i: number) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow border border-gray-200 p-4 flex gap-4"
          >
            <img
              src={item?.images?.[0] || "/placeholder.png"}
              alt={item.name}
              className="w-20 h-20 rounded-lg object-cover border border-gray-300"
            />

            <div className="flex flex-col flex-1">
              <span className="font-semibold text-black text-lg">{item.name}</span>

              <span className="text-sm text-gray-500">Qty: {item.qty}</span>

              <div className="text-sm text-gray-500 mt-1">
                <PriceInCurrency priceForCurrency={item.price} component="p" />
              </div>

              <div className="text-indigo-600 font-semibold mt-1">
                <PriceInCurrency priceForCurrency={item.qty * item.price} component="p" />
              </div>
            </div>
          </div>
        ))}

        {order.items?.length === 0 && (
          <div className="p-4 text-center text-gray-500">No items</div>
        )}
      </div>
    </div>
  </div>
);
}