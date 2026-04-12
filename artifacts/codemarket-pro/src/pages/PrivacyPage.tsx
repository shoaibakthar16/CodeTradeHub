import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const sections = [
  {
    title: "1. Information We Collect",
    content: `We collect information you provide directly to us, such as your name, email address, and payment information when you create an account or make a purchase. We also collect usage data such as pages visited, products viewed, and actions taken on the platform.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use your information to process transactions, send purchase confirmations and download links, provide customer support, improve our marketplace, and send you updates about new products (you may opt out at any time).`,
  },
  {
    title: "3. Information Sharing",
    content: `We do not sell your personal information. We may share your data with trusted third-party services (such as Stripe for payments and Firebase for authentication) solely to operate our platform. These providers are bound by strict data protection agreements.`,
  },
  {
    title: "4. Data Security",
    content: `We implement industry-standard security measures including SSL encryption, secure authentication via Firebase, and PCI-compliant payment processing via Stripe. However, no method of transmission over the internet is 100% secure.`,
  },
  {
    title: "5. Cookies",
    content: `We use cookies and similar tracking technologies to maintain your session, remember your preferences, and understand how you use our platform. You can disable cookies in your browser settings, though this may affect functionality.`,
  },
  {
    title: "6. Your Rights",
    content: `You have the right to access, update, or delete your personal information at any time via your dashboard settings. You may also request a copy of your data or ask us to stop processing it by contacting our support team.`,
  },
  {
    title: "7. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on our platform. Continued use of CodeTradeHub after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: "8. Contact Us",
    content: `If you have any questions about this Privacy Policy, please contact us via our Support page or email us directly. We are committed to resolving any concerns promptly.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: April 2026</p>

        <p className="text-muted-foreground mb-8">
          At CodeTradeHub, we take your privacy seriously. This policy explains what data we collect, how we use it, and your rights regarding that data.
        </p>

        <div className="space-y-8">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg font-semibold mb-2">{s.title}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
