import { useUsers } from "../../providers/UsersProvider";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function UsersPage() {
  const { users, loading } = useUsers();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
  <div className="p-4 md:p-6">
    <h1 className="text-2xl md:text-3xl font-semibold mb-4 text-black">
      Users
    </h1>

    {/* DESKTOP TABLE */}
    <div className="hidden md:block bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-gray-600 text-sm">
          <tr>
            <th className="p-4">User</th>
            <th className="p-4">Role</th>
            <th className="p-4">Created</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user: any) => (
            <tr
              key={user.id}
              onClick={() => navigate(`/user/${user.id}`)}
              className="cursor-pointer border-t border-gray-200 hover:bg-gray-50 transition"
            >
              <td className="p-4 flex items-center gap-3">
                <img
                  src={
                    user.avatar ||
                    `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=6366f1&color=fff`
                  }
                  className="w-10 h-10 rounded-full object-cover"
                />

                <div className="flex flex-col">
                  <span className="font-medium text-black">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-xs text-gray-400">{user.email}</span>
                </div>
              </td>

              <td className="p-4 text-black capitalize">
                {user.role || "user"}
              </td>

              <td className="p-4 text-gray-400">
                {user.createdAt?.seconds
                  ? format(user.createdAt.toDate(), "dd.MM.yyyy HH:mm")
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {users.length === 0 && (
        <div className="p-6 text-center text-gray-500">No users found</div>
      )}
    </div>

    {/* MOBILE CARDS */}
    <div className="md:hidden flex flex-col gap-4">
      {users.map((user: any) => (
        <div
          key={user.id}
          onClick={() => navigate(`/user/${user.id}`)}
          className="bg-white rounded-xl shadow border border-gray-200 p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition"
        >
          <img
            src={
              user.avatar ||
              `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=6366f1&color=fff`
            }
            className="w-14 h-14 rounded-full object-cover"
          />

          <div className="flex flex-col">
            <span className="font-medium text-black text-lg">
              {user.firstName} {user.lastName}
            </span>
            <span className="text-sm text-gray-500">{user.email}</span>

            <div className="text-xs text-gray-400 mt-1">
              {user.role || "user"} •{" "}
              {user.createdAt?.seconds
                ? format(user.createdAt.toDate(), "dd.MM.yyyy")
                : "—"}
            </div>
          </div>
        </div>
      ))}

      {users.length === 0 && (
        <div className="p-6 text-center text-gray-500">No users found</div>
      )}
    </div>
  </div>
);
}