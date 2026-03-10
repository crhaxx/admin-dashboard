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
    const q = query(
      collection(db, "activity"),
      orderBy("timestamp", "desc")
    );

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
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-black mb-6">Activity Log</h1>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-500">No activity recorded</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#ececec] text-gray-300">
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
                  className="border-t border-[#333] hover:bg-[#e7e7e7] transition cursor-pointer"
                  onClick={() => navigate(`/user/${log.userId}`)}
                >
                  <td className="p-3 text-black">{log.userName}</td>
                  <td className="p-3 text-gray-500">{log.action}</td>
                  <td className="p-3 text-gray-400">
                    {format(new Date(log.timestamp), "dd.MM.yyyy HH:mm")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}