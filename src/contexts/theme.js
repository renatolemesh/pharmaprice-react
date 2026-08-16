import { createContext, useContext } from "react";

export const STORAGE_KEY = "pharmaprice-theme";

export const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme precisa estar dentro de ThemeProvider");
  return context;
};
