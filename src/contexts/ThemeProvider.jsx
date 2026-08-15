import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { STORAGE_KEY, ThemeContext } from "./theme";

const temaInicial = () => {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo === "light" || salvo === "dark") return salvo;
  } catch {
    // localStorage bloqueado (aba anônima com cookies restritos)
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

/**
 * O index.css ja tinha um bloco `.dark` completo desde sempre — so que nada
 * nunca punha a classe no <html>, entao metade do design system era codigo
 * morto. Este provider e o interruptor que faltava. O script no index.html
 * aplica a classe antes da primeira pintura, pra tela nao piscar branca.
 */
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(temaInicial);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // sem persistência: o tema vale só para esta aba
    }
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((atual) => (atual === "dark" ? "light" : "dark")),
    [],
  );

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = { children: PropTypes.node };

export default ThemeProvider;
