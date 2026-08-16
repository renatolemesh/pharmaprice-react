import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { register } from "../services/api";
import { useAuth } from "../contexts/auth";
import AuthLayout, { campoClasse } from "../components/AuthLayout";

const CAMPOS = [
  { id: "name", label: "Nome", type: "text", autoComplete: "name" },
  { id: "email", label: "E-mail", type: "email", autoComplete: "email" },
  {
    id: "password",
    label: "Senha",
    type: "password",
    autoComplete: "new-password",
  },
  {
    id: "password_confirmation",
    label: "Confirmação da senha",
    type: "password",
    autoComplete: "new-password",
  },
];

const Register = () => {
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const { signIn } = useAuth();

  const enviar = async (event) => {
    event.preventDefault();

    if (values.password !== values.password_confirmation) {
      setMensagem("As senhas não são iguais.");
      return;
    }
    // O servidor exige 8 caracteres; checar aqui evita uma ida e volta.
    if (values.password.length < 8) {
      setMensagem("A senha precisa ter ao menos 8 caracteres.");
      return;
    }

    setEnviando(true);
    setMensagem("");

    try {
      const { token } = await register(values);
      if (!token) throw new Error("Resposta do servidor sem token");
      await signIn(token);
    } catch (error) {
      const detalhes = error?.body?.errors;
      setMensagem(
        detalhes
          ? Object.values(detalhes).flat().join(" ")
          : error.message || "Não foi possível concluir o cadastro.",
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthLayout title="Criar conta" subtitle="Leva menos de um minuto.">
      <form onSubmit={enviar} className="space-y-4">
        {CAMPOS.map(({ id, label, type, autoComplete }) => (
          <div key={id}>
            <label
              htmlFor={id}
              className="mb-1.5 block text-sm font-medium text-muted-foreground"
            >
              {label}
            </label>
            <input
              id={id}
              type={type}
              autoComplete={autoComplete}
              required
              value={values[id]}
              onChange={(e) => setValues({ ...values, [id]: e.target.value })}
              className={campoClasse}
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={enviando}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-dashboard-primary py-2.5 font-medium text-white transition-smooth hover:brightness-110 disabled:opacity-60"
        >
          {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
          {enviando ? "Registrando..." : "Registrar-se"}
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
        Já tem cadastro?{" "}
        <Link
          to="/login"
          className="font-medium text-dashboard-primary hover:underline"
        >
          Entrar
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
