import { Link } from "wouter";
import { Github, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="CodeTradeHub" className="w-7 h-7 rounded-lg object-cover" />
              <span className="font-bold tracking-tight">
                <span className="text-foreground">Code</span><span className="text-primary">TradeHub</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Premium source code marketplace for developers. Buy and sell website templates, SaaS kits, and app source code.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">Marketplace</h3>
            <ul className="space-y-2">
              {[
                { label: "All Products", href: "/products" },
                { label: "Templates", href: "/products?category=templates" },
                { label: "SaaS Kits", href: "/products?category=saas" },
                { label: "Mobile Apps", href: "/products?category=mobile" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">Account</h3>
            <ul className="space-y-2">
              {[
                { label: "Sign In", href: "/login" },
                { label: "Dashboard", href: "/dashboard" },
                { label: "My Orders", href: "/dashboard/orders" },
                { label: "Downloads", href: "/dashboard/downloads" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between mt-10 pt-6 border-t border-border gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} CodeTradeHub. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
