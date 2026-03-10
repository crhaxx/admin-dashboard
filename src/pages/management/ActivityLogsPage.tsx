import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

type LogEntry = {
  id: string;
  userName: string;
  userId: string;
  action: string;
  timestamp: number;
};

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "activity"), orderBy("timestamp", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        ...(doc.data() as LogEntry),
        id: doc.id,
      }));

      setLogs(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-semibold text-black mb-6">
        Activity Log
      </h1>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-500">No activity recorded</p>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-3 text-black">User</th>
                  <th className="p-3 text-black">Action</th>
                  <th className="p-3 text-black">Time</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-t border-gray-200 hover:bg-gray-100 transition cursor-pointer"
                    onClick={() => navigate(`/user/${log.userId}`)}
                  >
                    <td className="p-3 text-black">{log.userName}</td>
                    <td className="p-3 text-gray-600">{log.action}</td>
                    <td className="p-3 text-gray-500">
                      {format(new Date(log.timestamp), "dd.MM.yyyy HH:mm")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden flex flex-col gap-4">
            {logs.map((log) => (
              <div
                key={log.id}
                onClick={() => navigate(`/user/${log.userId}`)}
                className="bg-white rounded-xl shadow border border-gray-200 p-4 cursor-pointer active:scale-[0.98] transition"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-black text-lg">
                    {log.userName}
                  </span>

                  <span className="text-xs text-gray-500">
                    {format(new Date(log.timestamp), "dd.MM.yyyy HH:mm")}
                  </span>
                </div>

                <p className="text-gray-600 mt-2">{log.action}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}