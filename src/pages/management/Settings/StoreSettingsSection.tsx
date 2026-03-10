import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import toast from "react-hot-toast";

export default function StoreSettingsSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [storeName, setStoreName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [address, setAddress] = useState("");
  const [currency, setCurrency] = useState("CZK");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const ref = doc(db, "settings", "store");
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          await setDoc(ref, {
            storeName: "",
            contactEmail: "",
            address: "",
            currency: "CZK",
            logoUrl: "",
            createdAt: Date.now(),
          });
        }

        const data = (await getDoc(ref)).data();
        setStoreName(data!.storeName);
        setContactEmail(data!.contactEmail);
        setAddress(data!.address);
        setCurrency(data!.currency);
        setLogoUrl(data!.logoUrl);
      } catch (err) {
        toast.error("Failed to load store settings");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const save = async () => {
    try {
      setSaving(true);

      const ref = doc(db, "settings", "store");
      await updateDoc(ref, {
        storeName,
        contactEmail,
        address,
        currency,
        logoUrl,
        updatedAt: Date.now(),
      });

      toast.success("Store settings updated");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900">Store Settings</h2>
      <p className="text-gray-500 text-sm mb-6">
        Configure your store information, branding and regional settings.
      </p>

      <div className="space-y-6">
        <div>
          <label className="text-sm text-gray-600">Store Name</label>
          <input
            className="w-full mt-1 px-3 py-2 border rounded-lg"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Store Logo</label>
          <div className="mt-2 flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} className="w-full h-full object-cover" />
              ) : (
                "Logo"
              )}
            </div>
            <button
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              onClick={() => toast("Upload not implemented yet")}
            >
              Upload
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600">Contact Email</label>
          <input
            className="w-full mt-1 px-3 py-2 border rounded-lg"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Store Address</label>
          <input
            className="w-full mt-1 px-3 py-2 border rounded-lg"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Currency</label>
          <select
            className="w-full mt-1 px-3 py-2 border rounded-lg"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="CZK">CZK – Czech Koruna</option>
            <option value="EUR">EUR – Euro</option>
            <option value="USD">USD – US Dollar</option>
          </select>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </section>
  );
}