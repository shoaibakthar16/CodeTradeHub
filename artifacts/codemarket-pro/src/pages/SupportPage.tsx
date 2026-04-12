import { useState } from "react";
import { Link } from "wouter";
import { MessageCircle, Mail, BookOpen, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const faqs = [
  {
    q: "How do I download my purchased files?",
    a: "After a successful payment, go to Dashboard → Downloads. All your purchased products appear there with a Download button. You can re-download anytime — your purchases never expire.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards via Stripe (Visa, Mastercard, Amex). You can also pay via WhatsApp for manual bank transfer arrangements.",
  },
  {
    q: "Can I get a refund?",
    a: "Because source code is a digital product and is immediately accessible after purchase, all sales are generally final. If a product was materially misrepresented, contact support within 7 days and we will review your case.",
  },
  {
    q: "Do I need a license to use the purchased code commercially?",
    a: "Yes — each purchase grants you a non-exclusive commercial license to use the code in your own projects. You may not resell or redistribute the source code itself.",
  },
  {
    q: "How do I apply a coupon code?",
    a: "Add products to your cart, then go to the Cart page. You'll see a 'Coupon Code' input — enter your code and click Apply. The discount will be reflected in your order total.",
  },
  {
    q: "I'm having trouble signing in. What should I do?",
    a: "Try the 'Continue with Google' option for the smoothest experience. If using email/password, make sure you're using the correct email and check your spam folder for any verification emails.",
  },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const whatsappUrl = `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I need support with CodeTradeHub.")}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center mb-14">
          <h1 className="text-3xl font-bold mb-3">Support Center</h1>
          <p className="text-muted-foreground">Need help? We're here for you. Check the FAQs or reach out directly.</p>
        </div>

        {/* Contact cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-xl border border-border bg-card hover:border-green-500/40 hover:bg-green-500/5 transition-all group"
          >
            <MessageCircle className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="font-semibold mb-1">WhatsApp</h3>
            <p className="text-sm text-muted-foreground mb-3">Chat with us directly for fast responses.</p>
            <span className="text-xs text-green-400 flex items-center gap-1">
              Open WhatsApp <ExternalLink className="w-3 h-3" />
            </span>
          </a>

          <a
            href="mailto:support@codetradeHub.com"
            className="p-6 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all group"
          >
            <Mail className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-1">Email Support</h3>
            <p className="text-sm text-muted-foreground mb-3">Send us a message and we'll reply within 24 hours.</p>
            <span className="text-xs text-primary flex items-center gap-1">
              support@codetradehub.com <ExternalLink className="w-3 h-3" />
            </span>
          </a>

          <Link
            href="/products"
            className="p-6 rounded-xl border border-border bg-card hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all group"
          >
            <BookOpen className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="font-semibold mb-1">Browse Products</h3>
            <p className="text-sm text-muted-foreground mb-3">Explore our full catalogue of source code projects.</p>
            <span className="text-xs text-cyan-400">View all products →</span>
          </Link>
        </div>

        {/* FAQ */}
        <h2 className="text-xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-border rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/40 transition-colors"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="font-medium text-sm">{faq.q}</span>
                {openFaq === i
                  ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                }
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-muted-foreground mb-3">Still need help?</p>
          <Button asChild>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4 mr-2" /> Chat on WhatsApp
            </a>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
