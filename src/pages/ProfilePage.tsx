import { useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { auth, db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { useNavigate } from "react-router-dom";


export default function Profile() {
  const { user } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [message, setMessage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const { updateUserProfile } = useAuth();
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

    // Re-authenticate
    await reauthenticateWithCredential(currentUser!, credential);

    // Update password
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

    // URL obrázku
    const url = data.secure_url;

    // Ulož do Firestore
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
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
  <button
    onClick={() => navigate("/")}
    style={{
      padding: "8px 14px",
      borderRadius: "6px",
      background: "#eee",
      border: "1px solid #ccc",
      cursor: "pointer",
    }}
  >
    ← Zpět na dashboard
  </button>
</div>

        <h3>Profilová fotka</h3>

{photoURL && (
  <img
    src={photoURL}
    alt="Profilová fotka"
    style={{
      width: "120px",
      height: "120px",
      borderRadius: "50%",
      objectFit: "cover",
      marginBottom: "10px",
    }}
  />
)}

<input type="file" accept="image/*" onChange={handlePhotoUpload} />
      <h2>Profil</h2>

      <div style={{ marginTop: "20px", maxWidth: "300px" }}>
        <label>Jméno</label>
        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />

        <label>Příjmení</label>
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} />

        <button onClick={handleSave}>Uložit</button>

        {message && <p>{message}</p>}
      </div>
      <h3>Změna hesla</h3>

<label>Aktuální heslo</label>
<input
  type="password"
  value={currentPassword}
  onChange={(e) => setCurrentPassword(e.target.value)}
/>

<label>Nové heslo</label>
<input
  type="password"
  value={newPassword}
  onChange={(e) => setNewPassword(e.target.value)}
/>

<button onClick={handlePasswordChange}>Změnit heslo</button>
    </div>
  );
}