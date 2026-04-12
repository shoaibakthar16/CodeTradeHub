import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  ShoppingCart, Menu, X, User, LogOut, LayoutDashboard, Shield,
  ChevronDown, Home, Zap, Globe, ShoppingBag, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";


export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "U";

  const isActive = (href: string) => location === href;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[hsl(230_15%_7%/0.97)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] border-b border-white/8"
          : "bg-[hsl(230_15%_7%/0.85)] border-b border-white/5"
      } backdrop-blur-xl`}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-cyan-400 opacity-80" />
      {/* Bottom glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[66px]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-primary/30 blur-md group-hover:bg-primary/50 transition-all duration-300" />
              <img
                src="/logo.png"
                alt="CodeTradeHub"
                className="relative w-9 h-9 rounded-xl object-cover ring-1 ring-white/10 group-hover:ring-primary/50 transition-all duration-300"
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-[17px] tracking-tight">
                <span className="text-white">Code</span>
                <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">TradeHub</span>
              </span>
              <span className="text-[10px] text-muted-foreground/70 tracking-widest uppercase font-medium hidden sm:block">
                Source Code Market
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive(href)
                    ? "text-white"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                <span className="relative">{label}</span>
                {isActive(href) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-gradient-to-r from-primary to-cyan-400" />
                )}
              </Link>
            ))}

            {/* Categories dropdown — opens on hover */}
            <div
              className="relative"
              onMouseEnter={() => setCatOpen(true)}
              onMouseLeave={() => setCatOpen(false)}
            >
              <button className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-all duration-200">
                Templates <ChevronDown className={`w-3.5 h-3.5 mt-px transition-transform duration-200 ${catOpen ? "rotate-180" : ""}`} />
              </button>
              {catOpen && (
                <div className="absolute top-full left-0 mt-1 w-52 rounded-lg border border-white/10 bg-[hsl(230_15%_10%)] shadow-2xl py-1 z-50">
                  <Link
                    href="/products?category=wordpress"
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                    onClick={() => setCatOpen(false)}
                  >
                    <Globe className="w-4 h-4 text-blue-400/80 shrink-0" /> WordPress Templates
                  </Link>
                  <Link
                    href="/products?category=shopify"
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                    onClick={() => setCatOpen(false)}
                  >
                    <ShoppingBag className="w-4 h-4 text-green-400/80 shrink-0" /> Shopify Templates
                  </Link>
                  <Link
                    href="/products?category=blogger"
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                    onClick={() => setCatOpen(false)}
                  >
                    <BookOpen className="w-4 h-4 text-orange-400/80 shrink-0" /> Blogger Templates
                  </Link>
                </div>
              )}
            </div>

            {isAdmin && (
              <Link
                href="/admin"
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.startsWith("/admin")
                    ? "text-white"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                <span className="relative flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-primary" /> Admin
                </span>
                {location.startsWith("/admin") && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-gradient-to-r from-primary to-cyan-400" />
                )}
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1.5">

            {/* Browse CTA — desktop only */}
            <Link
              href="/products"
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary/15 hover:bg-primary/25 text-primary hover:text-white border border-primary/25 hover:border-primary/50 transition-all duration-200 mr-1"
            >
              <Zap className="w-3.5 h-3.5" />
              Browse
            </Link>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="relative w-9 h-9 rounded-lg hover:bg-white/8 transition-all"
              data-testid="button-cart"
            >
              <Link href="/cart">
                <ShoppingCart className="w-[18px] h-[18px]" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold bg-primary text-white ring-2 ring-background animate-pulse" data-testid="text-cart-count">
                    {itemCount}
                  </span>
                )}
              </Link>
            </Button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-white/6 border border-transparent hover:border-white/10 transition-all duration-200"
                    data-testid="button-user-menu"
                  >
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={user.photoURL || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-cyan-500 text-white text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-52 bg-[hsl(230_15%_10%)] border-white/10 shadow-2xl"
                >
                  <div className="px-3 py-2.5 border-b border-white/8">
                    <p className="text-sm font-semibold truncate text-white">{user.displayName || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2.5 cursor-pointer" data-testid="link-dashboard">
                        <LayoutDashboard className="w-4 h-4 text-primary/70" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-2.5 cursor-pointer" data-testid="link-admin">
                          <Shield className="w-4 h-4 text-primary/70" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </div>
                  <DropdownMenuSeparator className="bg-white/8" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300"
                    data-testid="button-logout"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="sm"
                asChild
                className="h-8 px-4 text-xs font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                data-testid="button-signin"
              >
                <Link href="/login">
                  <User className="w-3.5 h-3.5 mr-1.5" />
                  Sign in
                </Link>
              </Button>
            )}

            {/* Mobile toggle */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/8 transition-colors ml-1"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/8 py-3 space-y-0.5 pb-4">
            <Link
              href="/"
              className={`flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors ${isActive("/") ? "bg-white/8 text-white font-medium" : "text-muted-foreground hover:bg-white/5 hover:text-white"}`}
              onClick={() => setMobileOpen(false)}
            >
              <Home className="w-4 h-4" /> Home
            </Link>
            <Link
              href="/products"
              className={`flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors ${isActive("/products") ? "bg-white/8 text-white font-medium" : "text-muted-foreground hover:bg-white/5 hover:text-white"}`}
              onClick={() => setMobileOpen(false)}
            >
              <Zap className="w-4 h-4" /> Products
            </Link>
            <div className="h-px bg-white/8 mx-1 my-1.5" />
            <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Templates</p>
            <Link href="/products?category=wordpress" className="flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white transition-colors" onClick={() => setMobileOpen(false)}>
              <Globe className="w-4 h-4 text-blue-400/80" /> WordPress Templates
            </Link>
            <Link href="/products?category=shopify" className="flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white transition-colors" onClick={() => setMobileOpen(false)}>
              <ShoppingBag className="w-4 h-4 text-green-400/80" /> Shopify Templates
            </Link>
            <Link href="/products?category=blogger" className="flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white transition-colors" onClick={() => setMobileOpen(false)}>
              <BookOpen className="w-4 h-4 text-orange-400/80" /> Blogger Templates
            </Link>
            {user && (
              <>
                <div className="h-px bg-white/8 mx-1 my-2" />
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4 text-primary/60" /> Dashboard
                </Link>
              </>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <Shield className="w-4 h-4 text-primary/60" /> Admin Panel
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
