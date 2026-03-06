import { useAuth } from "../providers/AuthProvider";

export default function ProfilePage() {
    const { user } = useAuth();

  return (
    <div style={{ padding: "20px" }}>
      <h2>Profil</h2>

      <div style={{ marginTop: "20px" }}>
        <p><strong>Jméno:</strong> {user?.firstName}</p>
        <p><strong>Příjmení:</strong> {user?.lastName}</p>
        <p><strong>Email:</strong> {user?.email}</p>
      </div>
    </div>
  );

}