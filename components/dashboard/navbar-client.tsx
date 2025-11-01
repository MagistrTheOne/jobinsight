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

export function DashboardNavbar() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement global search functionality
    console.log("Search:", searchQuery);
  };

  return (
    <div className="h-14 sm:h-16 border-b border-neutral-800/50 bg-black/40 backdrop-blur-xl flex items-center justify-between px-3 sm:px-4 md:px-6 gap-2 sm:gap-4">
      {/* Mobile Menu Button - Hidden on desktop (sidebar is always visible) */}
      <div className="lg:hidden flex-shrink-0">
        {/* Menu button is handled by Sidebar Sheet */}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl min-w-0">
        <div className="relative">
          <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-neutral-400" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 sm:pl-10 pr-2 sm:pr-3 text-sm sm:text-base bg-neutral-900/50 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-blue-500 focus:ring-blue-500/20 w-full"
          />
        </div>
      </form>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        {/* Usage Limits - Mobile only (desktop has it in sidebar) */}
        <div className="lg:hidden">
          <UsageLimits />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-neutral-400 hover:text-white hover:bg-neutral-800/50">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 sm:w-80 bg-neutral-900 border-neutral-800">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-neutral-800" />
            <div className="p-4 text-center text-xs sm:text-sm text-neutral-400">
              No new notifications
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

