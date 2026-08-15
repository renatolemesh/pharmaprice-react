import { useState } from "react";
import { useLocation } from "react-router-dom";
import VerticalMenu from "./components/VerticalMenu";
import AppRouter from "./AppRouter";
import { useAuth } from "./contexts/auth";

const ROTAS_PUBLICAS = ["/login", "/register"];

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const { isLoading } = useAuth();
  const location = useLocation();

  const mostrarMenu = !ROTAS_PUBLICAS.includes(location.pathname);

  if (isLoading) {
    return (
      <div className="gradient-background flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-dashboard-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  if (!mostrarMenu) {
    return <AppRouter />;
  }

  return (
    <div className="gradient-background min-h-screen">
      <VerticalMenu isOpen={isMenuOpen} onToggleMenu={setIsMenuOpen} />
      {/* Margem so a partir de `md`: no celular o menu vira gaveta sobreposta,
          e a margem fixa de 16rem deixava o conteudo espremido fora da tela. */}
      <div
        className={`transition-smooth ${isMenuOpen ? "md:ml-64" : "md:ml-20"}`}
      >
        <main className="mx-auto w-full max-w-[1600px] px-4 pt-16 pb-10 md:px-6 md:pt-6">
          <AppRouter />
        </main>
      </div>
    </div>
  );
};

export default App;
