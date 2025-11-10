"use client";

import Link from "next/link";
import { Briefcase } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="about"
      aria-label="Site footer"
      className="bg-[#0b0b0b] border-t border-neutral-800/50 text-neutral-400 w-full pt-12 sm:pt-16 md:pt-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-white" />
              <span className="text-lg font-semibold text-white hover:text-blue-500 transition-colors">
                JobInsight AI
              </span>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-xs">
              AI-powered job application analysis and optimization platform.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-xs uppercase tracking-wide">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#features" className="hover:text-white transition">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-white transition">Pricing</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-xs uppercase tracking-wide">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#about" className="hover:text-white transition">About</Link></li>
              <li><Link href="#" className="hover:text-white transition">Blog</Link></li>
              <li><Link href="#" className="hover:text-white transition">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-xs uppercase tracking-wide">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-neutral-800/50 text-[11px] sm:text-xs text-neutral-500 flex flex-col sm:flex-row justify-between items-center gap-2 pb-8">
          <p className="text-center sm:text-left">© {currentYear} JobInsight AI. All rights reserved.</p>
          <p className="text-center sm:text-right">
            Created by <span className="text-white font-medium">MagistrTheOne</span> · 2025
          </p>
        </div>
      </div>
    </footer>
  );
}