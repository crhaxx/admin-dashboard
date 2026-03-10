import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import toast from "react-hot-toast";

export default function MaintenanceModeSection() {
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load maintenance settings
  useEffect(() => {
    const load = async () => {
      try {
        const ref = doc(db, "settings", "maintenance");
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          // Create default document
          await setDoc(ref, {
            enabled: false,
            message: "We are currently performing scheduled maintenance.",
            updatedAt: Date.now(),
          });

          setEnabled(false);
          setMessage("We are currently performing scheduled maintenance.");
        } else {
          const data = snap.data();
          setEnabled(data.enabled);
          setMessage(data.message);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load maintenance settings");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Save changes
  const save = async () => {
    try {
      setSaving(true);

      const ref = doc(db, "settings", "maintenance");
      await setDoc(ref, {
        enabled,
        message,
        updatedAt: Date.now(),
      });

      toast.success("Maintenance settings updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p className="text-gray-500">Loading maintenance settings…</p>
      </section>
    );
  }

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900">Maintenance Mode</h2>
      <p className="text-gray-500 text-sm mb-6">
        Temporarily disable the storefront while performing updates.
      </p>

      {/* Toggle */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <p className="font-medium text-gray-900">Enable Maintenance Mode</p>
          <p className="text-sm text-gray-500">
            Visitors will see a maintenance page. Admins can still access the dashboard.
          </p>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          <div className="w-11 h-6 bg-gray-300 peer-checked:bg-indigo-600 rounded-full transition"></div>
          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition"></div>
        </label>
      </div>

      {/* Custom message */}
      <div className="mt-6">
        <label className="text-sm text-gray-600">Maintenance Message</label>
        <textarea
          className="w-full mt-1 px-3 py-2 border rounded-lg h-28"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="mt-6 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save settings"}
      </button>
    </section>
  );
}