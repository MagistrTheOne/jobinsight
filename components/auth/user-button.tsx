"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, LogOut } from "lucide-react";
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-600 text-white">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={async () => {
            clearAuth();
            clearCurrent();
            await signOut({ callbackUrl: "/landing" });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

