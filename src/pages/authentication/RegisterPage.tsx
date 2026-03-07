import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const success = await register(name, lastname, email, password);

    if (!success) {
      setError("Registration failed");
      return;
    }

    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">

        <h1 className="text-3xl font-semibold text-center text-gray-900 dark:text-white">
          Create an account
        </h1>

        <p className="text-center text-gray-500 dark:text-gray-400 mt-2 mb-6">
          Join the dashboard platform
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              First Name
            </label>
            <input
              type="text"
              placeholder="John"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                         bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white 
                         focus:ring-2 focus:ring-black dark:focus:ring-gray-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Surname
            </label>
            <input
              type="text"
              placeholder="Doe"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                         bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white 
                         focus:ring-2 focus:ring-black dark:focus:ring-gray-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                         bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white 
                         focus:ring-2 focus:ring-black dark:focus:ring-gray-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                         bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white 
                         focus:ring-2 focus:ring-black dark:focus:ring-gray-500 outline-none"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="mt-2 w-full py-2 bg-black dark:bg-gray-700 text-white rounded-lg 
                       font-medium hover:opacity-90 transition"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-gray-600 dark:text-gray-400 mt-6 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-black dark:text-white font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}