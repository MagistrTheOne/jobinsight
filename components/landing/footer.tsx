"use client";

import Link from "next/link";
import { Briefcase } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="about" className="bg-[#0b0b0b] border-t border-neutral-800/50 text-neutral-400 min-h-[350px] sm:min-h-[400px] md:min-h-[450px] flex items-start">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 md:py-12 lg:py-16 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10 lg:gap-12 mb-8 sm:mb-10 md:mb-12">
          {/* Brand */}
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-300" />
              <span className="text-sm sm:text-base md:text-lg font-semibold text-white">JobInsight AI</span>
            </div>
            <p className="text-[11px] sm:text-xs md:text-sm leading-relaxed max-w-xs">
              AI-powered job application analysis and optimization platform.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-2 sm:mb-3 md:mb-4 text-[11px] sm:text-xs md:text-sm uppercase tracking-wide">
              Product
            </h3>
            <ul className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs md:text-sm">
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
            <h3 className="text-white font-semibold mb-2 sm:mb-3 md:mb-4 text-[11px] sm:text-xs md:text-sm uppercase tracking-wide">
              Company
            </h3>
            <ul className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs md:text-sm">
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
            <h3 className="text-white font-semibold mb-2 sm:mb-3 md:mb-4 text-[11px] sm:text-xs md:text-sm uppercase tracking-wide">
              Legal
            </h3>
            <ul className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs md:text-sm">
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
        <div className="border-t border-neutral-800/50 pt-4 sm:pt-6 md:pt-8 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3 md:gap-4 text-[10px] sm:text-xs md:text-sm">
          <p className="text-neutral-500 text-center sm:text-left">© {currentYear} JobInsight AI. All rights reserved.</p>
          <p className="text-neutral-500 text-center sm:text-right">
            Created by <span className="text-white font-medium">MagistrTheOne</span> · 2025
          </p>
        </div>
      </div>
    </footer>
  );
}
