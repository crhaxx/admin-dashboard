import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [redirecting, setRedirecting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/";

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-600 dark:text-gray-300 text-xl">
        Loading...
      </div>
    );
  }

  if (redirecting) {
  return (
    <div className="h-screen flex items-center justify-center text-gray-600 dark:text-gray-300 text-xl">
      Redirecting...
    </div>
  );
}

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const success = await login(email, password);

    if (!success) {
      setError("Invalid email or password");
      return;
    }

    setRedirecting(true);

  setTimeout(() => {
    navigate(from, { replace: true });
  }, 1000); // 1s delay
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        
        <h1 className="text-3xl font-semibold text-center text-gray-900 dark:text-white">
          Welcome back
        </h1>

        <p className="text-center text-gray-500 dark:text-gray-400 mt-2 mb-6">
          Sign in to your dashboard
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="text"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-gray-500 outline-none"
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
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-gray-500 outline-none"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="mt-2 w-full py-2 bg-black dark:bg-gray-700 text-white rounded-lg font-medium hover:opacity-90 transition"
          >
            Login
          </button>
        </form>

        <p className="text-center text-gray-600 dark:text-gray-400 mt-6 text-sm">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-black dark:text-white font-semibold hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}