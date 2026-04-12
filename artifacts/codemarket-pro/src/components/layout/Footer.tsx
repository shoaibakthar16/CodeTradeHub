import { Link } from "wouter";
import { Github, Twitter, MessageCircle, Mail, ShieldCheck, CreditCard, ArrowRight, Code2, Zap, Globe } from "lucide-react";

const MARKETPLACE_LINKS = [
  { label: "All Products", href: "/products" },
  { label: "Website Templates", href: "/products?category=templates" },
  { label: "SaaS Starter Kits", href: "/products?category=saas" },
  { label: "Mobile Apps", href: "/products?category=mobile" },
  { label: "Full-Stack Apps", href: "/products?category=fullstack" },
  { label: "WordPress Templates", href: "/products?category=wordpress" },
  { label: "Shopify Templates", href: "/products?category=shopify" },
  { label: "Browser Extensions", href: "/products?category=extensions" },
];

const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Support Center", href: "/support" },
  { label: "My Dashboard", href: "/dashboard" },
  { label: "My Orders", href: "/dashboard/orders" },
  { label: "Downloads", href: "/dashboard/downloads" },
  { label: "Wishlist", href: "/dashboard/wishlist" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Refund Policy", href: "/terms#4-refund-policy" },
  { label: "License Info", href: "/terms#3-purchases-licenses" },
  { label: "Cookie Policy", href: "/privacy#cookies" },
];

const SOCIAL_LINKS = [
  { icon: MessageCircle, href: `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}`, label: "WhatsApp", color: "hover:text-green-400 hover:border-green-500/40 hover:bg-green-500/5" },
  { icon: Mail, href: "mailto:support@codetradehub.com", label: "Email", color: "hover:text-primary hover:border-primary/40 hover:bg-primary/5" },
  { icon: Github, href: "#", label: "GitHub", color: "hover:text-foreground hover:border-white/20 hover:bg-white/5" },
  { icon: Twitter, href: "#", label: "Twitter", color: "hover:text-sky-400 hover:border-sky-500/40 hover:bg-sky-500/5" },
];

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "SSL Secured" },
  { icon: CreditCard, label: "Stripe Payments" },
  { icon: Zap, label: "Instant Download" },
];

export default function Footer() {
  return (
    <footer className="mt-20 relative overflow-hidden">
      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Main footer body */}
      <div className="bg-[hsl(230_15%_5%)] border-t border-white/5">

        {/* ── CTA strip ── */}
        <div className="border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="text-center sm:text-left">
              <p className="text-sm font-semibold text-foreground">Ready to launch your next project?</p>
              <p className="text-xs text-muted-foreground mt-0.5">Browse 100+ production-ready source code products.</p>
            </div>
            <Link href="/products">
              <button className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:translate-y-[-1px]">
                Browse Products <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>

        {/* ── Main columns ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* Brand column */}
            <div className="lg:col-span-4">
              <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <img src="/logo.png" alt="CodeTradeHub" className="w-5 h-5 rounded object-cover" />
                </div>
                <span className="text-base font-bold tracking-tight">
                  <span className="text-foreground">Code</span><span className="text-primary">TradeHub</span>
                </span>
              </Link>

              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-6">
                The premium marketplace for developers. Buy & sell production-ready templates, SaaS kits, and full-stack source code — built by developers, for developers.
              </p>

              {/* Stats row */}
              <div className="flex items-center gap-5 mb-6">
                {[
                  { icon: Code2, value: "100+", label: "Products" },
                  { icon: Globe, value: "50+", label: "Categories" },
                  { icon: ShieldCheck, value: "100%", label: "Secure" },
                ].map(({ icon: Icon, value, label }) => (
                  <div key={label} className="flex flex-col items-center gap-0.5">
                    <Icon className="w-3.5 h-3.5 text-primary mb-0.5" />
                    <span className="text-sm font-bold text-foreground">{value}</span>
                    <span className="text-[10px] text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>

              {/* Social icons */}
              <div className="flex items-center gap-2.5">
                {SOCIAL_LINKS.map(({ icon: Icon, href, label, color }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={`w-9 h-9 rounded-xl border border-white/8 flex items-center justify-center text-muted-foreground transition-all ${color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns — 2-col grid on mobile, 3 cols on desktop */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">

              {/* Marketplace */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">Marketplace</h4>
                <ul className="space-y-2.5">
                  {MARKETPLACE_LINKS.map(({ label, href }) => (
                    <li key={href}>
                      <Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:translate-x-0.5 inline-block">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">Company</h4>
                <ul className="space-y-2.5">
                  {COMPANY_LINKS.map(({ label, href }) => (
                    <li key={href}>
                      <Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:translate-x-0.5 inline-block">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div className="col-span-2 sm:col-span-1">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">Legal</h4>
                <ul className="space-y-2.5">
                  {LEGAL_LINKS.map(({ label, href }) => (
                    <li key={href}>
                      <Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:translate-x-0.5 inline-block">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* Copyright */}
            <p className="text-xs text-muted-foreground order-2 sm:order-1">
              &copy; {new Date().getFullYear()} <span className="text-foreground/70 font-medium">CodeTradeHub</span>. All rights reserved.
            </p>

            {/* Trust badges */}
            <div className="flex items-center gap-4 order-1 sm:order-2">
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-muted-foreground/60">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium hidden sm:block">{label}</span>
                </div>
              ))}
            </div>

            {/* Legal mini links */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground order-3">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/support" className="hover:text-foreground transition-colors">Support</Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
