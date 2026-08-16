import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { AuthContext } from "./auth";
import { checkAuth, clearToken, setToken } from "../services/auth";
import { clearApiCache } from "../services/api";

const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    status: "loading", // loading | authenticated | anonymous
    user: null,
    message: "",
  });

  useEffect(() => {
    const controller = new AbortController();

    checkAuth(controller.signal)
      .then(({ isAuthenticated, user, message }) =>
        setState({
          status: isAuthenticated ? "authenticated" : "anonymous",
          user: user ?? null,
          message: message ?? "",
        }),
      )
      .catch((error) => {
        if (error?.name !== "AbortError") {
          setState({ status: "anonymous", user: null, message: error.message });
        }
      });

    return () => controller.abort();
  }, []);

  /**
   * Login e logout trocavam o cookie e chamavam `window.location.reload()` pra
   * o resto do app perceber. Isso jogava fora o bundle ja carregado e refazia a
   * viagem inteira a cada entrada. Aqui o estado muda no lugar; so o cache de
   * dados e limpo, porque ele e por usuario.
   */
  const signIn = useCallback(async (token) => {
    setToken(token);
    clearApiCache();

    // POST /login devolve so `{ token }` — o papel do usuario, que decide se
    // ele ve o painel ou a tela de contato, so vem em GET /user. Sem esta
    // segunda ida todo mundo entraria como nao-admin.
    const { isAuthenticated, user, message } = await checkAuth();
    setState({
      status: isAuthenticated ? "authenticated" : "anonymous",
      user: user ?? null,
      message: message ?? "",
    });

    if (!isAuthenticated) throw new Error(message || "Falha ao iniciar sessão");
  }, []);

  const signOut = useCallback(() => {
    clearToken();
    clearApiCache();
    setState({ status: "anonymous", user: null, message: "" });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      isAuthenticated: state.status === "authenticated",
      isLoading: state.status === "loading",
      isAdmin: state.user?.role === "admin",
      signIn,
      signOut,
    }),
    [state, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = { children: PropTypes.node };

export default AuthProvider;
