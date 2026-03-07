import { useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { auth, db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, updateUserProfile } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [message, setMessage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");

  const navigate = useNavigate();

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
      });
      setMessage("Profil byl úspěšně aktualizován");
    } catch {
      setMessage("Chyba při ukládání");
    }
  };

  const handlePasswordChange = async () => {
    try {
      const currentUser = auth.currentUser;

      const credential = EmailAuthProvider.credential(
        currentUser!.email!,
        currentPassword
      );

      await reauthenticateWithCredential(currentUser!, credential);
      await updatePassword(currentUser!, newPassword);

      setMessage("Heslo bylo změněno");
    } catch (err) {
      console.error(err);
      setMessage("Chyba při změně hesla");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "dashboard");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dwukxfyoh/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      const url = data.secure_url;

      await updateDoc(doc(db, "users", user.uid), {
        photoURL: url,
      });

      setPhotoURL(url);
      setMessage("Profilová fotka byla aktualizována");

      updateUserProfile({ photoURL: url });
    } catch (err) {
      console.error(err);
      setMessage("Chyba při nahrávání fotky");
    }
  };

  return (
    <div className="min-h-screen p-6 text-black dark:text-white transition-colors duration-300 bg-white dark:bg-black">

      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="px-4 py-2 bg-gray-200 dark:bg-[#222] border border-gray-300 dark:border-[#444] rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-[#333] transition"
      >
        ← Zpět na dashboard
      </button>

      <h1 className="text-2xl font-semibold mt-6 mb-6">Nastavení profilu</h1>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Profile photo */}
        <div className="bg-white dark:bg-black p-6 rounded-xl shadow-md transition-colors duration-300">
          <h3 className="text-lg font-semibold mb-4">Profilová fotka</h3>

          {photoURL && (
            <img
              src={photoURL}
              alt="Profilová fotka"
              className="w-36 h-36 rounded-full object-cover border-4 border-gray-200 dark:border-[#333] mb-4"
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="text-sm"
          />
        </div>

        {/* Personal info */}
        <div className="bg-white dark:bg-[#111] p-6 rounded-xl shadow-md transition-colors duration-300">
          <h3 className="text-lg font-semibold mb-4">Osobní údaje</h3>

          <label className="font-medium mb-1 block">Jméno</label>
          <input
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-[#444] bg-white dark:bg-[#222] text-black dark:text-white mb-4"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <label className="font-medium mb-1 block">Příjmení</label>
          <input
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-[#444] bg-white dark:bg-[#222] text-black dark:text-white mb-4"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Uložit změny
          </button>
        </div>
      </div>

      {/* Password change */}
      <div className="bg-white dark:bg-[#111] p-6 rounded-xl shadow-md mt-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold mb-4">Změna hesla</h3>

        <label className="font-medium mb-1 block">Aktuální heslo</label>
        <input
          type="password"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-[#444] bg-white dark:bg-[#222] text-black dark:text-white mb-4"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <label className="font-medium mb-1 block">Nové heslo</label>
        <input
          type="password"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-[#444] bg-white dark:bg-[#222] text-black dark:text-white mb-4"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button
          onClick={handlePasswordChange}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          Změnit heslo
        </button>
      </div>

      {message && (
        <p className="mt-4 px-4 py-3 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg max-w-md">
          {message}
        </p>
      )}
    </div>
  );
}