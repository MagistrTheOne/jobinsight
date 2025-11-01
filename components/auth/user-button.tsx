"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { useAnalysisStore } from "@/store/analysis-store";

export function UserButton() {
  const { user, isAuthenticated, isLoading, clearAuth } = useAuthStore();
  const { clearCurrent } = useAnalysisStore();

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        Loading...
      </Button>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Link href="/auth/signin">
        <Button variant="outline" size="sm" className="bg-gray-800/50 border-gray-600/50">
          <User className="mr-2 h-4 w-4" />
          Sign In
        </Button>
      </Link>
    );
  }

  const userInitials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const userName = user.name || user.email?.split('@')[0] || 'User';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative w-full flex items-center gap-3 p-2 rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 hover:border-blue-500/50 transition-all group">
          <Avatar className="h-8 w-8 shrink-0">
            {user.image ? (
              <AvatarImage src={user.image} alt={userName} />
            ) : null}
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
              {userName}
            </p>
            {user.email && (
              <p className="text-xs text-neutral-400 truncate">
                {user.email}
              </p>
            )}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-neutral-900 border-neutral-800" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-white">{user.name}</p>
            <p className="text-xs leading-none text-neutral-400">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/dashboard">
          <DropdownMenuItem className="cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={async () => {
            clearAuth();
            clearCurrent();
            await authClient.signOut();
            window.location.href = "/landing";
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

