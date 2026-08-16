import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/auth";

const Logout = () => {
  const { isAuthenticated, signOut } = useAuth();

  useEffect(() => {
    if (isAuthenticated) signOut();
  }, [isAuthenticated, signOut]);

  // Antes isto era `navigate('/login')` seguido de `window.location.reload()`,
  // que descartava o bundle já carregado só pra o app reler o cookie.
  return isAuthenticated ? null : <Navigate to="/login" replace />;
};

export default Logout;
