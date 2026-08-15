import { ThemeToggle } from "@cv-builder/components";
import { useTheme } from "../context/theme.js";
import "./NavBar.css";

export function NavBar() {
  const { theme, setTheme } = useTheme();

  function handleToggle() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <nav className="cv-navbar" aria-label="Site navigation">
      <span className="cv-navbar__brand">CV Builder</span>
      <ThemeToggle theme={theme === "system" ? "light" : theme} onToggle={handleToggle} />
    </nav>
  );
}
