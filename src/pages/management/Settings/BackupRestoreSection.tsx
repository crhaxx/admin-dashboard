import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase";
import toast from "react-hot-toast";
import { useState } from "react";

export default function BackupRestoreSection() {
  const [importing, setImporting] = useState(false);

  const downloadJSON = (data:any, filename:any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCollection = async (col:any) => {
    try {
      const snap = await getDocs(collection(db, col));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      downloadJSON(data, `backup-${col}.json`);
      toast.success(`Exported ${col}`);
    } catch {
      toast.error("Export failed");
    }
  };

  const exportAll = async () => {
    try {
      const collections = ["products", "orders", "users"];
      const result: Record<string, any[]> = {};

      for (const col of collections) {
        const snap = await getDocs(collection(db, col));
        result[col] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }

      downloadJSON(result, "backup-all.json");
      toast.success("Export completed");
    } catch {
      toast.error("Export failed");
    }
  };

  const restoreCollection = async (col:any, items:any) => {
    for (const item of items) {
      const id = item.id;
      const data = { ...item };
      delete data.id;
      await setDoc(doc(db, col, id), data, { merge: true });
    }
  };

  const importData = async (e:any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);

      const text = await file.text();
      const json = JSON.parse(text);

      if (json.products && json.orders && json.users) {
        await restoreCollection("products", json.products);
        await restoreCollection("orders", json.orders);
        await restoreCollection("users", json.users);
      } else {
        const col = file.name.replace("backup-", "").replace(".json", "");
        await restoreCollection(col, json);
      }

      toast.success("Import completed");
    } catch {
      toast.error("Invalid backup file");
    } finally {
      setImporting(false);
    }
  };

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900">Backup & Restore</h2>
      <p className="text-gray-500 text-sm mb-6">
        Export or restore your store data. Useful for migrations or backups.
      </p>

      <div className="space-y-4">
        <button
          onClick={exportAll}
          className="w-full px-5 py-3 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Export all data
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={() => exportCollection("products")} className="px-5 py-3 bg-gray-100 rounded-lg hover:bg-gray-200">Export products</button>
          <button onClick={() => exportCollection("orders")} className="px-5 py-3 bg-gray-100 rounded-lg hover:bg-gray-200">Export orders</button>
          <button onClick={() => exportCollection("users")} className="px-5 py-3 bg-gray-100 rounded-lg hover:bg-gray-200">Export users</button>
        </div>

        <div className="mt-6">
          <label className="text-sm text-gray-600">Import data</label>
          <input type="file" accept=".json" onChange={importData} className="w-full mt-2 px-3 py-2 border rounded-lg bg-gray-50" />

          <button disabled={importing} className="mt-3 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            {importing ? "Importing…" : "Import"}
          </button>
        </div>
      </div>
    </section>
  );
}