import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-card border-t border-border mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 flex flex-col space-y-4">
            <div className="flex items-center">
            <Link href="/" className="flex items-center gap-1" id="navbar-logo">
                <Image src="/Extended Attendify Logo.jpg" alt="Extended Attendify logo" width={120} height={120} className="rounded-xl" />
            </Link>
          </div>
            <p className="text-sm font-normal text-secondary max-w-xs">
              Handcrafted enterprise SaaS for tracking time, scheduling shifts, and modernizing payroll workflows.
            </p>
          </div>

          {/* Product Links */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Product</h4>
            <Link href="#features" className="text-sm font-normal text-secondary hover:text-foreground transition-colors duration-200" id="footer-link-features">
              Features
            </Link>
            <Link href="#workflow" className="text-sm font-normal text-secondary hover:text-foreground transition-colors duration-200" id="footer-link-workflow">
              Workflow
            </Link>
            <Link href="#pricing" className="text-sm font-normal text-secondary hover:text-foreground transition-colors duration-200" id="footer-link-pricing">
              Pricing
            </Link>
          </div>

          {/* Resources Links */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Resources</h4>
            <Link href="/docs" className="text-sm font-normal text-secondary hover:text-foreground transition-colors duration-200" id="footer-link-docs">
              Documentation
            </Link>
            <Link href="/support" className="text-sm font-normal text-secondary hover:text-foreground transition-colors duration-200" id="footer-link-support">
              Support Centre
            </Link>
            <Link href="/blog" className="text-sm font-normal text-secondary hover:text-foreground transition-colors duration-200" id="footer-link-blog">
              Blog
            </Link>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Legal</h4>
            <Link href="/privacy" className="text-sm font-normal text-secondary hover:text-foreground transition-colors duration-200" id="footer-link-privacy">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm font-normal text-secondary hover:text-foreground transition-colors duration-200" id="footer-link-terms">
              Terms of Service
            </Link>
            <Link href="/security" className="text-sm font-normal text-secondary hover:text-foreground transition-colors duration-200" id="footer-link-security">
              Security
            </Link>
          </div>
        </div>

        {/* Bottom copyright block */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-normal text-secondary" id="footer-copyright">
            &copy; {currentYear} Attendify Inc. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <span className="text-xs font-normal text-secondary">
              Handcrafted in London
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
