import PropTypes from "prop-types";
import { Link } from "react-router-dom";

export const campoClasse =
  "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-foreground outline-none transition-smooth placeholder:text-muted-foreground/60 focus:border-dashboard-primary focus:ring-2 focus:ring-dashboard-primary/30";

/**
 * Moldura das telas de login e cadastro.
 *
 * As duas usavam `bg-gray-900`/`bg-gray-800` cravados no JSX — a unica parte do
 * app que ignorava o design system e ficava escura mesmo no tema claro.
 */
const AuthLayout = ({ title, subtitle, children }) => (
  <div className="gradient-background flex min-h-screen items-center justify-center p-4">
    <div className="w-full max-w-md">
      <div className="mb-6 text-center">
        {/* A logo volta para a apresentação: sem isto, quem abre /login direto
            não tem caminho de volta para a página que explica o produto. */}
        <Link to="/" className="inline-block">
          <img
            src="/logo.png"
            alt="PharmaPrice"
            className="mx-auto mb-4 h-12 w-auto"
          />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="gradient-card rounded-card border border-border p-6 shadow-metric sm:p-8">
        {children}
      </div>
    </div>
  </div>
);

AuthLayout.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node,
};

export default AuthLayout;
