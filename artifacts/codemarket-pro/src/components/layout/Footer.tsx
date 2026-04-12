import { Link } from "wouter";
import { Github, Twitter, MessageCircle, Mail } from "lucide-react";

export default function Footer() {
  const whatsappUrl = `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}`;

  return (
    <footer className="border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="CodeTradeHub" className="w-7 h-7 rounded-lg object-cover" />
              <span className="font-bold tracking-tight">
                <span className="text-foreground">Code</span><span className="text-primary">TradeHub</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs mb-5">
              Premium source code marketplace for developers. Buy production-ready website templates, SaaS kits, and full app source code.
            </p>
            <div className="flex items-center gap-3">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-green-400 hover:border-green-500/40 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="mailto:support@codetradehub.com" className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
                <Mail className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Marketplace</h3>
            <ul className="space-y-2.5">
              {[
                { label: "All Products", href: "/products" },
                { label: "Templates", href: "/products?category=templates" },
                { label: "SaaS Kits", href: "/products?category=saas" },
                { label: "Mobile Apps", href: "/products?category=mobile" },
                { label: "Full-Stack Apps", href: "/products?category=fullstack" },
                { label: "WordPress Plugins", href: "/products?category=wordpress" },
                { label: "Blogger Templates", href: "/products?category=blogger" },
                { label: "Shopify Templates", href: "/products?category=shopify" },
                { label: "Browser Extensions", href: "/products?category=extensions" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Company</h3>
            <ul className="space-y-2.5">
              {[
                { label: "About Us", href: "/about" },
                { label: "Support", href: "/support" },
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

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Legal</h3>
            <ul className="space-y-2.5">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms & Conditions", href: "/terms" },
                { label: "Refund Policy", href: "/terms#4-refund-policy" },
                { label: "License Info", href: "/terms#3-purchases-licenses" },
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

        <div className="flex flex-col sm:flex-row items-center justify-between mt-12 pt-6 border-t border-border gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} CodeTradeHub. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/support" className="hover:text-foreground transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
