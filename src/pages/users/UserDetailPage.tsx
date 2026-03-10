import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs, deleteDoc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { getAuth } from "firebase/auth";
import { useAuth } from "../../providers/AuthProvider";

export default function UserDetailPage() {
  const { id } = useParams();
  const {user} = useAuth();
  const navigate = useNavigate();

  const [displayedUser, setDisplayedUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user + orders + activity
  useEffect(() => {
    async function fetchData() {
      // USER
      const ref = doc(db, "users", id!);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setDisplayedUser({ id: snap.id, ...snap.data() });
      }

      // ORDERS
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, where("userId", "==", id));
      const ordersSnap = await getDocs(q);

      setOrders(
        ordersSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );

      // ACTIVITY LOG (optional collection)
      const logRef = collection(db, "activity");
      const q2 = query(logRef, where("userId", "==", id));
      const logSnap = await getDocs(q2);

      setActivity(
        logSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );

      setLoading(false);
    }

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  if (!displayedUser) {
    return (
      <div className="p-6 text-center text-gray-500">
        User not found
      </div>
    );
  }

  const avatarUrl =
    displayedUser.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayedUser.firstName + " " + displayedUser.lastName
    )}&background=6366f1&color=fff`;

  const deleteUser = async () => {
  const auth = getAuth();

  // Prevent deleting yourself
  if (auth.currentUser?.uid === id) {
    toast.error("You cannot delete your own admin account");
    return;
  }

  if (!confirm("Do you really want to delete this user?")) return;

  try {
    await updateDoc(doc(db, "users", id!), {
      deleted: true,
      disabled: true,
      deletedAt: Date.now(),
    });

    toast.success("User Deleted");

    await addDoc(collection(db, "activity"), {
            userName: user.firstName + " " + user.lastName,
            userId: user.uid,
            action: "Deleted user " + displayedUser.firstName + " " + displayedUser.lastName,
            timestamp: Date.now(),
        });

    navigate("/users");
  } catch (err) {
    console.error(err);
    toast.error("Failed to delete user");
  }
};

  const updateRole = async (newRole: string) => {
  try {
    await updateDoc(doc(db, "users", id!), { role: newRole });

    setDisplayedUser((prev: any) => ({ ...prev, role: newRole }));
    toast.success("Role updated");
  } catch (err) {
    console.error(err);
    toast.error("Failed to update role");
  }
};

  return (
    <div className="p-6">
      <button
        onClick={() => navigate("/users")}
        className="px-4 py-2 mb-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
      >
        ← Back to Users
      </button>

      {/* PROFILE HEADER */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
        <div className="flex items-center gap-6">
          <img
            src={avatarUrl}
            alt={displayedUser.firstName}
            className="w-24 h-24 rounded-full object-cover ring-2 ring-indigo-500/40"
          />

          <div>
            <h1 className="text-2xl font-semibold text-black">
              {displayedUser.firstName} {displayedUser.lastName}
            </h1>
            <p className="text-gray-400">{displayedUser.email}</p>

            {/* ROLE BADGE */}
            <select
  value={displayedUser.role}
  onChange={(e) => updateRole(e.target.value)}
  className="
    mt-2 px-3 py-1 rounded-lg text-sm font-medium
    bg-white text-black border border-gray-400
    focus:ring-2 focus:ring-indigo-500
  "
>
  <option value="user">User</option>
  <option value="admin">Admin</option>
</select>
          </div>
        </div>

        {/* INFO CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="p-4 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 text-sm">Orders</p>
            <p className="text-xl font-semibold text-black">{orders.length}</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 text-sm">Last Login</p>
            <p className="text-black">
              {displayedUser.lastLogin?.seconds
                ? format(displayedUser.createdAt.toDate(), "dd.MM.yyyy, hh:mm")
                : "—"}
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 text-sm">Member Since</p>
            <p className="text-black">
              {displayedUser.createdAt?.seconds
                ? format(displayedUser.createdAt.toDate(), "dd.MM.yyyy")
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* USER ORDERS */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4 text-black">User Orders</h2>

        {orders.length === 0 ? (
          <p className="text-gray-500">No orders found</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => navigate(`/order/${o.id}`)}
                  className="cursor-pointer border-t border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="p-3 text-black">{o.id}</td>
                  <td className="p-3 text-black">${o.total.toFixed(2)}</td>
                  <td className="p-3 text-black">{o.status}</td>
                  <td className="p-3 text-gray-400">
                    {o.createdAt?.seconds
                      ? format(o.createdAt.toDate(), "dd.MM.yyyy HH:mm")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ACTIVITY LOG */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4 text-black">Activity Log</h2>

        {activity.length === 0 ? (
          <p className="text-gray-500">No activity recorded</p>
        ) : (
          <ul className="space-y-3">
            {activity.map((a) => (
              <li key={a.id} className="text-gray-300">
                <span className="font-medium text-black">{a.action}</span>{" "}
                — {format(new Date(a.timestamp), "dd.MM.yyyy HH:mm")}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* DANGER ZONE */}
      <div className="bg-red-900/10 border border-red-700 rounded-xl p-6 mt-6">
        <h2 className="text-lg font-semibold text-red-500 mb-2">Danger Zone</h2>
        <p className="text-red-400 text-sm mb-4">
          Deleting this user is permanent and cannot be undone.
        </p>
        

        <button
          onClick={deleteUser}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Delete User
        </button>
      </div>
    </div>
  );
}