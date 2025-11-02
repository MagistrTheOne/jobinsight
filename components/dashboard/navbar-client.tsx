"use client";

import * as React from "react";
import { Search, Bell, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UsageLimits } from "@/components/usage/usage-limits";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { LanguageToggle } from "@/components/dashboard/language-toggle";
import { LandingToggle } from "@/components/dashboard/landing-toggle";

export function DashboardNavbar() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement global search functionality
    console.log("Search:", searchQuery);
  };

  return (
    <div className="bg-black/60 backdrop-blur-2xl border-b border-white/5">
      {/* Breadcrumbs - Enhanced */}
      <Breadcrumbs />
      
      {/* Main Navbar - Centered and Compact */}
      <div className="h-10 sm:h-11 flex items-center justify-center px-2 sm:px-4 md:px-6 gap-2 sm:gap-3 border-t border-white/5">
        {/* Search - Centered */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl min-w-0 flex justify-center">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-400" />
            <Input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 sm:pl-10 pr-2 sm:pr-3 h-8 sm:h-9 text-xs sm:text-sm bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-white/20 focus:ring-1 focus:ring-white/10 w-full backdrop-blur-sm"
            />
          </div>
        </form>

        {/* Right Side Actions - Compact */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Usage Limits - Mobile only */}
          <div className="lg:hidden">
            <UsageLimits />
          </div>

          {/* Language Toggle */}
          <div className="hidden sm:block">
            <LanguageToggle />
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Landing/Dashboard Toggle */}
          <div className="hidden md:block">
            <LandingToggle />
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 bg-white/5 border border-white/10 hover:bg-white/10 text-white">
                <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 sm:w-72 bg-black/95 backdrop-blur-xl border-white/10">
              <DropdownMenuLabel className="text-xs text-white">Уведомления</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/5" />
              <div className="p-4 text-center text-xs text-neutral-500">
                Нет новых уведомлений
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

