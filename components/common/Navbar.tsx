"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="w-full bg-card border-b border-border sticky top-0 z-50 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2" id="navbar-logo">
                <Image src="/Extended Attendify Logo.jpg" alt="Extended Attendify logo" width={100} height={100} className="rounded-xl" />
            </Link>
          </div>

          {/* Desktop Navigation Link Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="#features"
              className="text-sm font-normal text-secondary hover:text-foreground transition-colors duration-200"
              id="nav-link-features"
            >
              Features
            </Link>
            <Link
              href="#workflow"
              className="text-sm font-normal text-secondary hover:text-foreground transition-colors duration-200"
              id="nav-link-workflow"
            >
              How it Works
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-normal text-secondary hover:text-foreground transition-colors duration-200"
              id="nav-link-testimonials"
            >
              Customers
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-normal text-secondary hover:text-foreground transition-colors duration-200"
              id="nav-link-pricing"
            >
              Pricing
            </Link>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-normal text-secondary hover:text-foreground px-3 py-2 transition-colors duration-200"
              id="btn-login-desktop"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-normal bg-primary text-primary-foreground hover:bg-opacity-90 px-4 py-2 rounded-xl shadow-soft transition-all duration-200"
              id="btn-register-desktop"
            >
              Start Free
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-lg text-secondary hover:text-foreground focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
              id="btn-mobile-menu-toggle"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden bg-card border-b border-border transition-all duration-200" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="#features"
              onClick={toggleMenu}
              className="block px-3 py-2 rounded-md text-base font-normal text-secondary hover:text-foreground hover:bg-background"
              id="nav-link-features-mobile"
            >
              Features
            </Link>
            <Link
              href="#workflow"
              onClick={toggleMenu}
              className="block px-3 py-2 rounded-md text-base font-normal text-secondary hover:text-foreground hover:bg-background"
              id="nav-link-workflow-mobile"
            >
              How it Works
            </Link>
            <Link
              href="#testimonials"
              onClick={toggleMenu}
              className="block px-3 py-2 rounded-md text-base font-normal text-secondary hover:text-foreground hover:bg-background"
              id="nav-link-testimonials-mobile"
            >
              Customers
            </Link>
            <Link
              href="#pricing"
              onClick={toggleMenu}
              className="block px-3 py-2 rounded-md text-base font-normal text-secondary hover:text-foreground hover:bg-background"
              id="nav-link-pricing-mobile"
            >
              Pricing
            </Link>
          </div>
          <div className="pt-4 pb-4 border-t border-border px-4 flex flex-col space-y-3">
            <Link
              href="/login"
              onClick={toggleMenu}
              className="w-full text-center py-2 text-base font-normal text-secondary hover:text-foreground border border-border rounded-xl transition-colors duration-200"
              id="btn-login-mobile"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={toggleMenu}
              className="w-full text-center py-2 text-base font-normal bg-primary text-primary-foreground hover:bg-opacity-90 rounded-xl shadow-soft transition-all duration-200"
              id="btn-register-mobile"
            >
              Start Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
