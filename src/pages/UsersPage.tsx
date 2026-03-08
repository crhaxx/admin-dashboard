import { useUsers } from "../providers/UsersProvider";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function UsersPage() {
  const { users, loading } = useUsers();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 text-white">Users</h1>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow border border-gray-200 dark:border-[#333] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-[#111] text-gray-600 dark:text-gray-300 text-sm">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Created</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user: any) => (
              <tr
                key={user.id}
                className="border-t border-gray-200 dark:border-[#333] hover:bg-gray-50 dark:hover:bg-[#222] transition"
              >
                <td className="p-4 font-medium text-white">{user.name}</td>
                <td className="p-4 text-white">{user.email}</td>
                <td className="p-4 text-white">{user.role || "user"}</td>

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
    </div>
  );
}