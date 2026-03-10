import { useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { auth, db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import defaultpfp from "../assets/defaultpfp.png";
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
      setMessage("Profile updated successfully");
    } catch {
      setMessage("Error while saving profile");
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

      setMessage("Password changed successfully");
    } catch (err) {
      console.error(err);
      setMessage("Error while changing password");
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
      setMessage("Profile photo updated");

      updateUserProfile({ photoURL: url });
    } catch (err) {
      console.error(err);
      setMessage("Error while uploading photo");
    }
  };

  return (
    
    <div className="min-h-screen p-6 text-black bg-[#F5F5F5]">
{/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="px-4 py-2 bg-gray-200 border border-gray-300 rounded-lg text-sm hover:bg-gray-300 transition"
      >
        ← Back to Dashboard
      </button>
      <h1 className="text-2xl font-semibold mt-6 mb-6">Profile Settings</h1>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Profile photo */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Profile Photo</h3>

          {(photoURL || defaultpfp) && (
            <img
              src={photoURL || defaultpfp}
              alt="Profile"
              className="w-36 h-36 rounded-full object-cover border-4 border-gray-200 mb-4"
            />
          )}

          <div className="space-y-2">

  <label
    htmlFor="photo-upload"
    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg cursor-pointer hover:bg-blue-700 transition"
  >
    Upload Photo
  </label>

  <input
    id="photo-upload"
    type="file"
    accept="image/*"
    onChange={handlePhotoUpload}
    className="hidden"
  />
</div>
        </div>

        {/* Personal info */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>

          <label className="font-medium mb-1 block">First Name</label>
          <input
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-black mb-4"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <label className="font-medium mb-1 block">Last Name</label>
          <input
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-black mb-4"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Password change */}
      <div className="bg-white p-6 rounded-xl shadow-md mt-6">
        <h3 className="text-lg font-semibold mb-4">Change Password</h3>

        <label className="font-medium mb-1 block">Current Password</label>
        <input
          type="password"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-black mb-4"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <label className="font-medium mb-1 block">New Password</label>
        <input
          type="password"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-black mb-4"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button
          onClick={handlePasswordChange}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          Change Password
        </button>
      </div>

      {message && (
        <p className="mt-4 px-4 py-3 bg-blue-100 text-blue-700 rounded-lg max-w-md">
          {message}
        </p>
      )}
    </div>
  );
}