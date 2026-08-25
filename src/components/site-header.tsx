import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/book", label: "Book" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { user, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-background/85 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <Link to="/" className="font-display text-xl tracking-tight">
          Maison<span className="text-primary">Lune</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              activeProps={{ className: "text-foreground font-medium" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              {isAdmin && (
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin">Admin</Link>
                </Button>
              )}
              <Button asChild variant="ghost" size="sm">
                <Link to="/appointments">My bookings</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/profile">
                  <UserIcon className="size-4" /> Profile
                </Link>
              </Button>
              <Button size="sm" variant="ghost" onClick={() => void signOut()}>
                Sign out
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </div>

        <button
          className="md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div className={cn("border-t md:hidden", open ? "block" : "hidden")}>
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-3">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="hover:bg-muted rounded-md px-2 py-2 text-sm"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-1 border-t pt-2">
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setOpen(false)} className="px-2 py-2 text-sm">
                    Admin
                  </Link>
                )}
                <Link
                  to="/appointments"
                  onClick={() => setOpen(false)}
                  className="px-2 py-2 text-sm"
                >
                  My bookings
                </Link>
                <Link to="/profile" onClick={() => setOpen(false)} className="px-2 py-2 text-sm">
                  Profile
                </Link>
                <button
                  className="px-2 py-2 text-left text-sm"
                  onClick={() => {
                    setOpen(false);
                    void signOut();
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="px-2 py-2 text-sm">
                Sign in
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
