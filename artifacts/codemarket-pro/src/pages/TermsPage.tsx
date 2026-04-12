import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using CodeTradeHub, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our platform. These terms apply to all users including buyers, sellers, and visitors.`,
  },
  {
    title: "2. Use of the Platform",
    content: `You must be at least 18 years old to use CodeTradeHub. You agree not to use the platform for any unlawful purpose, to upload malicious code, to infringe intellectual property rights, or to misrepresent your identity or products.`,
  },
  {
    title: "3. Purchases & Licenses",
    content: `When you purchase source code on CodeTradeHub, you receive a non-exclusive, non-transferable license to use the code for your own personal or commercial projects. You may not resell, redistribute, or sublicense the code without explicit written permission from the original seller.`,
  },
  {
    title: "4. Refund Policy",
    content: `Due to the digital nature of source code, all sales are generally final once a download link has been accessed. Refunds may be granted at our discretion in cases of product misrepresentation. Please contact support within 7 days of purchase.`,
  },
  {
    title: "5. Seller Responsibilities",
    content: `Sellers are responsible for ensuring their products are original, functional, and accurately described. CodeTradeHub reserves the right to remove any product that violates our quality standards or infringes on third-party rights.`,
  },
  {
    title: "6. Intellectual Property",
    content: `All content on CodeTradeHub, including our logo, brand name, and platform code, is the intellectual property of CodeTradeHub. Product source code remains the intellectual property of its respective sellers unless otherwise stated.`,
  },
  {
    title: "7. Limitation of Liability",
    content: `CodeTradeHub is provided "as is" without any warranties. We are not liable for any damages arising from your use of the platform or from purchased source code. Our total liability in any dispute shall not exceed the amount paid for the relevant transaction.`,
  },
  {
    title: "8. Modifications",
    content: `We reserve the right to modify these Terms at any time. Continued use of the platform after changes are posted constitutes your acceptance of the revised terms. We will notify users of material changes via email.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <h1 className="text-3xl font-bold mb-2">Terms & Conditions</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: April 2026</p>

        <p className="text-muted-foreground mb-8">
          These Terms and Conditions govern your use of the CodeTradeHub platform. Please read them carefully before using our services.
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
