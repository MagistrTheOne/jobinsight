"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Briefcase, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { UserButton } from '@/components/auth/user-button';
import { useAuthStore } from '@/store/auth-store';

export function LandingNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0b0b0b]/95 backdrop-blur-md border-b border-neutral-800/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/landing" className="flex items-center gap-2 sm:gap-3 group">
            <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 group-hover:text-blue-400 transition-colors" />
            <span className="text-lg sm:text-xl font-bold text-white">JobInsight AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link href="#features" className="text-sm text-neutral-300 hover:text-white transition-colors font-medium">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-neutral-300 hover:text-white transition-colors font-medium">
              Pricing
            </Link>
            <Link href="#about" className="text-sm text-neutral-300 hover:text-white transition-colors font-medium">
              About
            </Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-3 sm:gap-4">
            {isAuthenticated ? (
              <UserButton />
            ) : (
              <>
                <Link href="/auth/signin" className="hidden sm:block">
                  <Button variant="ghost" size="sm" className="text-neutral-300 hover:text-white hover:bg-neutral-800/50 h-9 px-4">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup" className="hidden sm:block">
                  <Button size="sm" className="bg-neutral-800 hover:bg-neutral-700 text-white h-9 px-4">
                    Get Started
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9 text-neutral-300 hover:text-white hover:bg-neutral-800/50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="pb-4 pt-2 space-y-1 border-t border-neutral-800/50 mt-2">
            <Link 
              href="#features" 
              className="block px-3 py-2.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800/30 rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="#pricing" 
              className="block px-3 py-2.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800/30 rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              href="#about" 
              className="block px-3 py-2.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800/30 rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            {!isAuthenticated && (
              <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-neutral-800/50">
                <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-neutral-300 hover:text-white hover:bg-neutral-800/30 h-10">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-neutral-800 hover:bg-neutral-700 text-white h-10">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

