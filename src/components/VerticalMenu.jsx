import { useState } from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  FileText,
  History,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/auth";
import { useTheme } from "../contexts/theme";

const ITENS = [
  { to: "/dashboard", label: "Painel", icon: BarChart3 },
  { to: "/precos", label: "Comparar Preços", icon: Search },
  { to: "/historico", label: "Histórico de Preços", icon: History },
  { to: "/relatorios", label: "Relatórios", icon: FileText },
];

const VerticalMenu = ({ isOpen, onToggleMenu }) => {
  const [mobileAberto, setMobileAberto] = useState(false);
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Fechar a gaveta no clique, e nao num efeito sobre `location.pathname`:
  // navegar e o evento, entao e no evento que a resposta pertence.
  const fechar = () => setMobileAberto(false);

  const largura = isOpen ? "w-64" : "w-20";

  const linkClasse = ({ isActive }) =>
    [
      "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-smooth",
      isActive
        ? "bg-sidebar-accent font-semibold text-white"
        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-white",
    ].join(" ");

  return (
    <>
      {/* Barra superior — só no celular */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur md:hidden">
        <button
          type="button"
          onClick={() => setMobileAberto(true)}
          className="rounded-lg p-2 text-foreground hover:bg-muted"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        {/* O logo e bem largo (proporcao ~11:1): sem o teto de largura ele
            estoura os 375px de um celular e cria rolagem horizontal. */}
        <img
          src="/logo.png"
          alt="PharmaPrice"
          className="h-7 w-auto max-w-[70%] object-contain object-left"
        />
      </div>

      {mobileAberto && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={fechar}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar transition-smooth ${largura} ${
          mobileAberto ? "translate-x-0" : "-translate-x-full"
        } w-64 md:translate-x-0 ${isOpen ? "md:w-64" : "md:w-20"}`}
      >
        <div className="flex items-center justify-between px-4 py-5">
          <img
            src="/logo.png"
            alt="PharmaPrice"
            className={`h-9 w-auto max-w-[80%] object-contain object-left transition-smooth ${
              isOpen ? "opacity-100" : "md:hidden"
            }`}
          />
          <button
            type="button"
            onClick={fechar}
            className="rounded-lg p-1.5 text-sidebar-foreground hover:bg-sidebar-accent md:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {ITENS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={linkClasse}
              onClick={fechar}
              title={!isOpen ? label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className={isOpen ? "" : "md:hidden"}>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="space-y-1 border-t border-sidebar-border p-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/80 transition-smooth hover:bg-sidebar-accent/60 hover:text-white"
            title={!isOpen ? "Alternar tema" : undefined}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 shrink-0" />
            ) : (
              <Moon className="h-5 w-5 shrink-0" />
            )}
            <span className={isOpen ? "" : "md:hidden"}>
              {theme === "dark" ? "Tema claro" : "Tema escuro"}
            </span>
          </button>

          <NavLink
            to="/logout"
            onClick={fechar}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/80 transition-smooth hover:bg-destructive/20 hover:text-white"
            title={!isOpen ? "Sair" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className={isOpen ? "" : "md:hidden"}>Sair</span>
          </NavLink>

          {isOpen && user?.name && (
            <p className="truncate px-3 pt-2 text-xs text-sidebar-muted">
              {user.name}
            </p>
          )}
        </div>

        {/* Recolher — só faz sentido no desktop */}
        <button
          type="button"
          onClick={() => onToggleMenu(!isOpen)}
          className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-lg transition-smooth hover:text-white md:flex"
          aria-label={isOpen ? "Recolher menu" : "Expandir menu"}
        >
          {isOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </aside>
    </>
  );
};

VerticalMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onToggleMenu: PropTypes.func.isRequired,
};

export default VerticalMenu;
