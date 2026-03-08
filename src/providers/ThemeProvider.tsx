// import { createContext, useContext } from "react";
// import { useTheme } from "../hooks/useTheme";

// type ThemeContextType = {
//   theme: string;
//   toggleTheme: () => void;
// };

// const ThemeContext = createContext<ThemeContextType | null>(null);

// export function ThemeProvider({ children }: { children: React.ReactNode }) {
//   const themeState = useTheme();

//   return (
//     <ThemeContext.Provider value={themeState}>
//       {children}
//     </ThemeContext.Provider>
//   );
// }

// export function useThemeContext() {
//   const ctx = useContext(ThemeContext);
//   if (!ctx) {
//     throw new Error("useThemeContext must be used inside ThemeProvider");
//   }
//   return ctx;
// }