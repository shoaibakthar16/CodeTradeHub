import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, X, User, LogOut, LayoutDashboard, Shield, ChevronDown, Info, HeadphonesIcon, FileText, Home } from "lucide-react";
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

const moreLinks = [
  { label: "About Us", href: "/about", icon: Info },
  { label: "Support", href: "/support", icon: HeadphonesIcon },
  { label: "Terms & Conditions", href: "/terms", icon: FileText },
  { label: "Privacy Policy", href: "/privacy", icon: FileText },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, userProfile, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const [location, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "U";

  const navLinkClass = (href: string) =>
    `text-sm transition-all ${location === href ? "text-foreground font-medium bg-white/6 shadow-inner" : "text-muted-foreground hover:text-foreground hover:bg-white/4"}`;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-lg shadow-[0_1px_0_0_hsl(var(--border))]">
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <img src="/logo.png" alt="CodeTradeHub" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-bold text-lg tracking-tight">
              <span className="text-foreground">Code</span><span className="text-primary">TradeHub</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className={`px-3 py-2 rounded-md ${navLinkClass("/")}`}>
              Home
            </Link>
            <Link href="/products" className={`px-3 py-2 rounded-md ${navLinkClass("/products")}`}>
              Products
            </Link>

            {/* More dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors">
                  More <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {moreLinks.map(({ label, href, icon: Icon }) => (
                  <DropdownMenuItem key={href} asChild>
                    <Link href={href} className="flex items-center gap-2 cursor-pointer">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      {label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {isAdmin && (
              <Link href="/admin" className={`px-3 py-2 rounded-md ${navLinkClass("/admin")}`}>
                Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Button variant="ghost" size="icon" asChild className="relative" data-testid="button-cart">
              <Link href="/cart">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground" data-testid="text-cart-count">
                    {itemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.photoURL || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium truncate">{user.displayName || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer" data-testid="link-dashboard">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2 cursor-pointer" data-testid="link-admin">
                        <Shield className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-destructive" data-testid="button-logout">
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" asChild data-testid="button-signin">
                <Link href="/login">
                  <User className="w-4 h-4 mr-1.5" />
                  Sign in
                </Link>
              </Button>
            )}

            {/* Mobile menu toggle */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-3 space-y-1">
            <Link href="/" className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>
              <Home className="w-4 h-4" /> Home
            </Link>
            <Link href="/products" className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>
              Products
            </Link>
            <div className="h-px bg-border mx-3 my-1" />
            {moreLinks.map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href} className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted transition-colors text-muted-foreground" onClick={() => setMobileOpen(false)}>
                <Icon className="w-4 h-4" /> {label}
              </Link>
            ))}
            {user && (
              <>
                <div className="h-px bg-border mx-3 my-1" />
                <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
              </>
            )}
            {isAdmin && (
              <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>
                <Shield className="w-4 h-4" /> Admin
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
