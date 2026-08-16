import { Suspense, lazy } from "react";
import PropTypes from "prop-types";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/auth";
import { TableSkeleton } from "./components/ui/feedback";
import Landing from "./pages/Landing";
import Precos from "./pages/Precos";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Logout from "./pages/Logout";
import Pricing from "./pages/Pricing";

// Recharts sozinho da 409kB (116kB comprimido). As tres telas que desenham
// grafico ficam fora do bundle inicial — quem abre o app pra comparar preco nao
// paga por biblioteca de grafico que nao chegou a ver.
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Historico = lazy(() => import("./pages/Historico"));
const Relatorios = lazy(() => import("./pages/Relatorios"));
const Produto = lazy(() => import("./pages/Produto"));

/** Rota que exige sessao. Guarda de onde veio, pra voltar depois do login. */
const RequireAuth = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
};

/**
 * Rota so de admin.
 *
 * A regra antiga vivia num useEffect com a condicao
 * `path !== '/login' || path !== '/register'` — sempre verdadeira, porque
 * nenhum caminho e os dois ao mesmo tempo. Na pratica todo usuario nao-admin
 * caia em /pricing, inclusive vindo da propria tela de login, e a navegacao
 * corria por efeito colateral depois da tela ja ter renderizado.
 */
const RequireAdmin = ({ children }) => {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/pricing" replace />;
  return children;
};

const GuestOnly = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? "/precos" : "/pricing"} replace />;
  }
  return children;
};

const guardProps = { children: PropTypes.node };
RequireAuth.propTypes = guardProps;
RequireAdmin.propTypes = guardProps;
GuestOnly.propTypes = guardProps;

const admin = (element) => (
  <RequireAuth>
    <RequireAdmin>
      <Suspense fallback={<TableSkeleton rows={6} />}>{element}</Suspense>
    </RequireAdmin>
  </RequireAuth>
);

const AppRouter = () => (
  <Routes>
    {/* A raiz é a apresentação, não um atalho para o app: quem chega sem
        sessão precisa de uma tela que explique o produto. Ela não redireciona
        quem já está logado — o botão dela é que muda para "Abrir o painel",
        senão o dono do site nunca conseguiria rever a própria landing. */}
    <Route path="/" element={<Landing />} />
    <Route path="/precos" element={admin(<Precos />)} />
    <Route path="/produto/:ean" element={admin(<Produto />)} />
    <Route path="/historico" element={admin(<Historico />)} />
    <Route path="/relatorios" element={admin(<Relatorios />)} />
    <Route path="/dashboard" element={admin(<Dashboard />)} />
    <Route
      path="/pricing"
      element={
        <RequireAuth>
          <Pricing />
        </RequireAuth>
      }
    />
    <Route
      path="/login"
      element={
        <GuestOnly>
          <Login />
        </GuestOnly>
      }
    />
    <Route
      path="/register"
      element={
        <GuestOnly>
          <Register />
        </GuestOnly>
      }
    />
    <Route path="/logout" element={<Logout />} />
    <Route path="*" element={<Navigate to="/precos" replace />} />
  </Routes>
);

export default AppRouter;
