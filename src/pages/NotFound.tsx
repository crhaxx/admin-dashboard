export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <div className="text-center">
        <h1 className="text-8xl font-extrabold text-gray-900 tracking-tight">
          404
        </h1>

        <p className="mt-4 text-xl text-gray-600">
          The page was not found.
        </p>

        <p className="mt-2 text-gray-500">
          It may have been moved or does not exist.
        </p>

        <a
          href="/"
          className="mt-8 inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-all"
        >
          Back to main page
        </a>
      </div>

      <div className="mt-12 opacity-80 animate-pulse">
        <svg
          width="180"
          height="180"
          viewBox="0 0 24 24"
          fill="none"
          className="text-gray-300"
        >
          <path
            d="M12 2L2 7v7c0 5 4 8 10 8s10-3 10-8V7l-10-5z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9" cy="12" r="1" fill="currentColor" />
          <circle cx="15" cy="12" r="1" fill="currentColor" />
          <path
            d="M9 16c1.5 1 4.5 1 6 0"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}