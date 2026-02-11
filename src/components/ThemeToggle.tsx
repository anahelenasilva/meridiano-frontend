import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const getIcon = () => {
    if (theme === "light") {
      return <Sun className="h-5 w-5" />;
    }
    if (theme === "dark") {
      return <Moon className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  const getLabel = () => {
    if (theme === "light") {
      return "Switch to dark theme";
    }
    if (theme === "dark") {
      return "Switch to system theme";
    }
    return "Switch to light theme";
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleTheme();
    }
  };

  return (
    <button
      onClick={toggleTheme}
      onKeyDown={handleKeyDown}
      aria-label={getLabel()}
      className="flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      type="button"
    >
      {getIcon()}
    </button>
  );
}
