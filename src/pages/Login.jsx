import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { login } from "../services/api";
import { useAuth } from "../contexts/auth";
import AuthLayout, { campoClasse } from "../components/AuthLayout";

const Login = () => {
  const [values, setValues] = useState({ email: "", password: "" });
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [verSenha, setVerSenha] = useState(false);
  const { signIn } = useAuth();

  const enviar = async (event) => {
    event.preventDefault();
    setEnviando(true);
    setMensagem("");

    try {
      const { token } = await login(values);
      if (!token) throw new Error("Resposta do servidor sem token");
      // Sem `window.location.reload()`: o provider troca o estado no lugar e o
      // roteador já redireciona pra tela certa conforme o papel do usuário.
      await signIn(token);
    } catch (error) {
      setMensagem(
        error?.status === 401
          ? "E-mail ou senha incorretos."
          : error.message || "Não foi possível entrar.",
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Acompanhe preços das farmácias em um só lugar."
    >
      <form onSubmit={enviar} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-muted-foreground"
          >
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={(e) => setValues({ ...values, email: e.target.value })}
            className={campoClasse}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-muted-foreground"
          >
            Senha
          </label>
          <div className="relative">
            <input
              id="password"
              type={verSenha ? "text" : "password"}
              autoComplete="current-password"
              required
              value={values.password}
              onChange={(e) => setValues({ ...values, password: e.target.value })}
              className={`${campoClasse} pr-11`}
            />
            <button
              type="button"
              onClick={() => setVerSenha((v) => !v)}
              aria-label={verSenha ? "Ocultar senha" : "Mostrar senha"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-smooth hover:text-foreground"
            >
              {verSenha ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-dashboard-primary py-2.5 font-medium text-white transition-smooth hover:brightness-110 disabled:opacity-60"
        >
          {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
          {enviando ? "Entrando..." : "Entrar"}
        </button>

        {mensagem && (
          <p
            role="alert"
            className="rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm text-destructive"
          >
            {mensagem}
          </p>
        )}
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Não tem cadastro?{" "}
        <Link
          to="/register"
          className="font-medium text-dashboard-primary hover:underline"
        >
          Registre-se
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
