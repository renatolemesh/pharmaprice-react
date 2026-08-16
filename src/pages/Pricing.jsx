import { Mail } from "lucide-react";
import { useAuth } from "../contexts/auth";
import AuthLayout from "../components/AuthLayout";

const Pricing = () => {
  const { user, signOut } = useAuth();

  return (
    <AuthLayout title="Acesso pendente">
      <div className="space-y-4 text-center">
        <Mail className="mx-auto h-10 w-10 text-dashboard-primary" />
        <p className="text-sm text-muted-foreground">
          {user?.name ? `Olá, ${user.name}. ` : ""}
          Sua conta ainda não tem acesso liberado ao comparador. Entre em contato
          para habilitar.
        </p>
        <button
          type="button"
          onClick={signOut}
          className="text-sm font-medium text-dashboard-primary hover:underline"
        >
          Sair
        </button>
      </div>
    </AuthLayout>
  );
};

export default Pricing;
