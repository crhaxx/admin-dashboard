import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import toast from "react-hot-toast";

export default function EmailTemplatesSection() {
  const templates = [
    { id: "orderConfirmation", name: "Order Confirmation" },
    { id: "orderShipped", name: "Order Shipped" },
    { id: "orderDelivered", name: "Order Delivered" },
    { id: "passwordReset", name: "Password Reset" },
    { id: "welcomeEmail", name: "Welcome Email" },
  ];

  const [selected, setSelected] = useState("orderConfirmation");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const ref = doc(db, "emailTemplates", selected);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          await setDoc(ref, {
            subject: "",
            body: "",
            createdAt: Date.now(),
          });
          setSubject("");
          setBody("");
        } else {
          const data = snap.data();
          setSubject(data.subject);
          setBody(data.body);
        }
      } catch {
        toast.error("Failed to load template");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [selected]);

  const save = async () => {
    try {
      setSaving(true);

      const ref = doc(db, "emailTemplates", selected);
      await setDoc(ref, {
        subject,
        body,
        updatedAt: Date.now(),
      });

      toast.success("Template saved");
    } catch {
      toast.error("Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900">Email Templates</h2>
      <p className="text-gray-500 text-sm mb-6">
        Customize the emails stored in your system. Emails are not being sent.
      </p>

      <div>
        <label className="text-sm text-gray-600">Template</label>
        <select
          className="w-full mt-1 px-3 py-2 border rounded-lg"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500 mt-6">Loading template…</p>
      ) : (
        <>
          <div className="mt-6">
            <label className="text-sm text-gray-600">Subject</label>
            <input
              className="w-full mt-1 px-3 py-2 border rounded-lg"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="mt-6">
            <label className="text-sm text-gray-600">Email Body</label>
            <textarea
              className="w-full mt-1 px-3 py-2 border rounded-lg h-40"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="mt-6 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save template"}
          </button>
        </>
      )}
    </section>
  );
}