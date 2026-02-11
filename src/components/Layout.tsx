import { NavLink } from "@/components/NavLink";
import { MESSAGES } from "@/constants/messages";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "@/utils/toast";
import {
  Bookmark,
  FileText,
  LogOut,
  Menu,
  Newspaper,
  PanelLeft,
  Pin,
  PinOff,
  Settings,
  User,
  X,
} from "lucide-react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { to: "/", label: "Bookmarks", icon: Bookmark },
  { to: "/articles", label: "Articles", icon: FileText },
  { to: "/youtube-transcriptions", label: "YouTube", icon: "youtube" as const },
  { to: "/briefings", label: "Briefings", icon: Newspaper },
  { to: "/admin/youtube-channels", label: "Admin", icon: Settings },
];

const SidebarContext = createContext({ pinned: false, setPinned: (_: boolean) => { } });

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function CollapsibleSidebar() {
  const { pinned, setPinned } = useContext(SidebarContext);
  const [hovered, setHovered] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const expanded = pinned || hovered;

  const handleMouseEnter = () => {
    if (pinned) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setHovered(true), 150);
  };

  const handleMouseLeave = () => {
    if (pinned) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setHovered(false), 300);
  };

  const handleLogout = () => {
    logout();
    toast.success(MESSAGES.SUCCESS.LOGGED_OUT);
    navigate("/login");
  };

  return (
    <>
      {!pinned && !hovered && (
        <div
          className="fixed left-0 top-0 z-50 hidden md:block h-screen w-4"
          onMouseEnter={handleMouseEnter}
        />
      )}

      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "fixed left-0 top-0 z-50 hidden md:flex h-screen flex-col border-r border-border bg-background py-4 transition-all duration-200 ease-in-out",
          expanded ? "w-52" : "w-14"
        )}
      >
        <div className={cn("flex items-center px-3 mb-4", expanded ? "justify-between" : "justify-center")}>
          <Link to="/" className="flex items-center gap-2 overflow-hidden">
            <FileText className="h-6 w-6 shrink-0 text-primary" />
            {expanded && <span className="font-serif font-bold text-base truncate">Meridiano</span>}
          </Link>
          {expanded && (
            <button
              onClick={() => setPinned(!pinned)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary"
              title={pinned ? "Unpin sidebar" : "Pin sidebar"}
            >
              {pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </button>
          )}
        </div>

        <nav className="flex flex-col gap-0.5 px-2 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={cn(
                "flex items-center gap-3 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary",
                expanded ? "px-3 py-2" : "justify-center px-0 py-2.5"
              )}
              activeClassName="text-primary bg-secondary"
            >
              {item.icon === "youtube" ? (
                <YouTubeIcon className="h-[18px] w-[18px] shrink-0" />
              ) : (
                <item.icon className="h-[18px] w-[18px] shrink-0" />
              )}
              {expanded && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="px-2 mt-2 space-y-2">
          <div className={cn("flex", expanded ? "justify-start" : "justify-center")}>
            <ThemeToggle />
          </div>
          {isAuthenticated && user && expanded && (
            <div className="rounded-md border border-border bg-card p-3 space-y-2">
              <p className="text-xs text-muted-foreground truncate">
                {user.username || user.email}
              </p>
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => navigate("/bookmarks")}
                  className="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  <Bookmark className="h-4 w-4" />
                  <span>My Bookmarks</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
          {isAuthenticated && user && !expanded && (
            <div className="flex justify-center" title={user.username || user.email}>
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>

        {expanded && (
          <div className="px-2 mt-2">
            <button
              onClick={() => {
                setPinned(false);
                setHovered(false);
              }}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <PanelLeft className="h-[18px] w-[18px] shrink-0" />
              <span className="truncate">Collapse</span>
            </button>
          </div>
        )}
      </aside>

      {expanded && !pinned && (
        <div
          className="fixed inset-0 z-40 hidden md:block"
          onClick={() => setHovered(false)}
        />
      )}
    </>
  );
}

function MobileHeader() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpen(false);
    toast.success(MESSAGES.SUCCESS.LOGGED_OUT);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 md:hidden border-b border-border bg-background/90 backdrop-blur-md">
      <div className="flex h-12 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <span className="font-serif font-bold text-lg">Meridiano</span>
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="text-muted-foreground p-2 rounded-md hover:bg-secondary"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-border bg-background p-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className="flex items-center gap-3 px-4 py-3 text-sm rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary"
              activeClassName="text-primary bg-secondary"
              onClick={() => setOpen(false)}
            >
              {item.icon === "youtube" ? (
                <YouTubeIcon className="h-4 w-4" />
              ) : (
                <item.icon className="h-4 w-4" />
              )}
              {item.label}
            </NavLink>
          ))}
          <div className="border-t border-border mt-2 pt-2 px-2">
            <ThemeToggle />
          </div>
          {isAuthenticated && user && (
            <div className="mt-2 space-y-1">
              <p className="px-4 py-2 text-xs text-muted-foreground truncate">
                {user.username || user.email}
              </p>
              <button
                onClick={() => {
                  navigate("/bookmarks");
                  setOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm rounded-md text-foreground hover:bg-secondary"
              >
                <Bookmark className="h-4 w-4" />
                My Bookmarks
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm rounded-md text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [pinned, setPinned] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sidebar-pinned") === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebar-pinned", String(pinned));
  }, [pinned]);

  return (
    <SidebarContext.Provider value={{ pinned, setPinned }}>
      <div className="min-h-screen bg-background">
        <CollapsibleSidebar />
        <MobileHeader />
        <div className={cn("transition-all duration-200", pinned ? "md:pl-52" : "md:pl-14")}>
          {children}
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
