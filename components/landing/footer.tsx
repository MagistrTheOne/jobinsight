"use client";

import Link from "next/link";
import { Briefcase } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="about" className="bg-[#0b0b0b] border-t border-neutral-800/50 text-neutral-400">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-10 sm:mb-12">
          {/* Brand */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-neutral-300" />
              <span className="text-base sm:text-lg font-semibold text-white">JobInsight AI</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed max-w-xs">
              AI-powered job application analysis and optimization platform.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-wide">
              Product
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="#features" className="hover:text-white transition-colors inline-block">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-white transition-colors inline-block">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors inline-block">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-wide">
              Company
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="#about" className="hover:text-white transition-colors inline-block">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors inline-block">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors inline-block">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-wide">
              Legal
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="#" className="hover:text-white transition-colors inline-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors inline-block">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors inline-block">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800/50 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm">
          <p className="text-neutral-500">© {currentYear} JobInsight AI. All rights reserved.</p>
          <p className="text-neutral-500 text-center sm:text-right">
            Created by <span className="text-white font-medium">MagistrTheOne</span> · 2025
          </p>
        </div>
      </div>
    </footer>
  );
}
