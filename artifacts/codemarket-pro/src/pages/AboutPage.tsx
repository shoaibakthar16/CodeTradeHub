import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Users, Code2, Globe, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold mb-4">About <span className="text-primary">CodeTradeHub</span></h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The premium marketplace where developers buy and sell production-ready source code — so you ship faster and build smarter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {[
            { icon: Code2, title: "Built for Developers", desc: "Every product is reviewed for code quality, documentation, and real-world usability. No fluff — just working code." },
            { icon: Zap, title: "Ship in Days, Not Months", desc: "Skip the boilerplate. Buy a production-ready SaaS kit or app template and launch your idea in days." },
            { icon: Users, title: "Growing Community", desc: "Join thousands of developers who trust CodeTradeHub to buy and sell source code projects." },
            { icon: Globe, title: "Global Marketplace", desc: "Sellers from all over the world list their best work. Buyers get the world's best code in one place." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 rounded-xl border border-border bg-card">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We believe great software shouldn't start from scratch. CodeTradeHub connects developers who have built something valuable with those who need it — creating a thriving ecosystem of reusable, high-quality code.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
