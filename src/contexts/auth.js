import { createContext, useContext } from "react";

/*
 * Contexto e hook ficam separados do provider de proposito: um arquivo que
 * exporta componente e nao-componente ao mesmo tempo derruba o Fast Refresh do
 * Vite, e a tela recarrega inteira a cada edicao.
 */
export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return context;
};
