import { createContext, useContext } from "react";

export const DashboardContext = createContext(null);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard precisa estar dentro de DashboardProvider");
  }
  return context;
};
