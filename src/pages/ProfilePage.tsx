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

  const cardStyle = {
    background: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
    marginBottom: "24px",
    maxWidth: "420px",
  };

  const labelStyle = {
    fontWeight: 500,
    marginBottom: "6px",
    display: "block",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "14px",
    fontSize: "15px",
    transition: "0.2s",
  };

  const buttonPrimary = {
    padding: "10px 16px",
    background: "#4f8cff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 500,
    transition: "0.2s",
  };

  const buttonSecondary = {
    padding: "8px 14px",
    background: "#eee",
    border: "1px solid #ccc",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  };

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
  <div style={{ padding: "20px" }}>
    <button onClick={() => navigate("/")} style={buttonSecondary}>
      ← Zpět na dashboard
    </button>

    <h1 style={{ marginTop: "20px", marginBottom: "20px" }}>
      Nastavení profilu
    </h1>

    {/* GRID LAYOUT */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px",
        alignItems: "start",
      }}
    >
      {/* Profilová fotka */}
      <div style={cardStyle}>
        <h3 style={{ marginBottom: "16px" }}>Profilová fotka</h3>

        {photoURL && (
          <img
            src={photoURL}
            alt="Profilová fotka"
            style={{
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: "14px",
              border: "3px solid #e5e5e5",
            }}
          />
        )}

        <input type="file" accept="image/*" onChange={handlePhotoUpload} />
      </div>

      {/* Osobní údaje */}
      <div style={cardStyle}>
        <h3 style={{ marginBottom: "16px" }}>Osobní údaje</h3>

        <label style={labelStyle}>Jméno</label>
        <input
          style={inputStyle}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <label style={labelStyle}>Příjmení</label>
        <input
          style={inputStyle}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        <button style={buttonPrimary} onClick={handleSave}>
          Uložit změny
        </button>
      </div>
    </div>

    {/* Změna hesla – přes celou šířku */}
    <div style={{ ...cardStyle, maxWidth: "100%", marginTop: "24px" }}>
      <h3 style={{ marginBottom: "16px" }}>Změna hesla</h3>

      <label style={labelStyle}>Aktuální heslo</label>
      <input
        type="password"
        style={inputStyle}
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />

      <label style={labelStyle}>Nové heslo</label>
      <input
        type="password"
        style={inputStyle}
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <button style={buttonPrimary} onClick={handlePasswordChange}>
        Změnit heslo
      </button>
    </div>

    {message && (
      <p
        style={{
          marginTop: "10px",
          padding: "10px 14px",
          background: "#e8f0ff",
          borderRadius: "8px",
          color: "#2a4dbf",
          maxWidth: "420px",
        }}
      >
        {message}
      </p>
    )}
  </div>
);
}