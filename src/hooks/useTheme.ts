// import { useEffect, useState } from "react";

// export function useTheme() {
//   const [theme, setTheme] = useState(
//     localStorage.getItem("theme") || "light"
//   );

//   useEffect(() => {
//     const html = document.documentElement;

//     if (theme === "dark") {
//       html.classList.add("dark");
//     } else {
//       html.classList.remove("dark");
//     }

//     localStorage.setItem("theme", theme);
//   }, [theme]);

//   const toggleTheme = () => {
//     setTheme(theme === "dark" ? "light" : "dark");
//   };

//   return { theme, toggleTheme };
// }