import Cookies from "js-cookie";
import { fetchCurrentUser } from "./api";

const TOKEN = "token";

export const getToken = () => Cookies.get(TOKEN);

export const setToken = (token) =>
  Cookies.set(TOKEN, token, {
    expires: 1,
    secure: window.location.protocol === "https:",
    sameSite: "strict",
  });

export const clearToken = () => Cookies.remove(TOKEN);

export const checkAuth = async (signal) => {
  const token = getToken();
  if (!token) return { isAuthenticated: false, message: "Sessão não iniciada" };

  try {
    const user = await fetchCurrentUser(token, signal);
    return user
      ? { isAuthenticated: true, user }
      : { isAuthenticated: false, message: "Sessão inválida" };
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    // Token vencido ou revogado: limpar evita ficar tentando a cada carga.
    if (error?.status === 401) clearToken();
    return {
      isAuthenticated: false,
      message: error?.message || "Não foi possível validar a sessão",
    };
  }
};
