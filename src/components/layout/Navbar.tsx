"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  TrendingUp,
  LayoutDashboard,
  Star,
  Trophy,
  LogOut,
  Menu,
  BarChart3,
  PieChart,
  User as UserIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { NotificationBell } from "./NotificationBell";

const navLinks = [
  { href: "/", label: "Home", icon: TrendingUp },
  { href: "/markets", label: "Markets", icon: BarChart3 },
  { href: "/watchlist", label: "Watchlist", icon: Star },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

const authLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: PieChart },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-navy/80 backdrop-blur-xl">
      <div className="flex h-14 items-center px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2 mr-8">
          <div className="h-8 w-8 rounded-lg bg-cyan flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-navy" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground hidden sm:block">
            StockScope
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-cyan/10 text-cyan"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        {user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/50 border border-border/50">
              <span className="text-xs text-muted-foreground">Balance</span>
              <span className="text-sm font-mono font-semibold text-amber">
                ${user.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <NotificationBell />

            <DropdownMenu>
              <DropdownMenuTrigger className="h-8 w-8 rounded-full p-0 inline-flex items-center justify-center hover:bg-muted transition-colors outline-none">
                <Avatar className="h-8 w-8 border border-cyan/30">
                  <AvatarFallback className="bg-cyan/10 text-cyan text-xs font-semibold">
                    {user.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/analytics")}>
                  <PieChart className="h-4 w-4 mr-2" />
                  Analytics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/watchlist")}>
                  <Star className="h-4 w-4 mr-2" />
                  Watchlist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <UserIcon className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg px-2.5 h-7 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg px-2.5 h-7 text-sm font-semibold bg-cyan text-navy hover:bg-cyan/90 transition-colors"
            >
              Sign up
            </Link>
          </div>
        )}

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger className="md:hidden ml-2 h-8 w-8 p-0 inline-flex items-center justify-center rounded-lg hover:bg-muted transition-colors outline-none">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-navy border-border/50">
            <div className="flex flex-col gap-1 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-cyan/10 text-cyan"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
              {user &&
                authLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-cyan/10 text-cyan"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              {!user && (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 text-sm font-semibold text-cyan"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
