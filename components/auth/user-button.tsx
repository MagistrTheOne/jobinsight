"use client";

import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { User, LogOut, LayoutDashboard, CheckCircle2, Crown, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { useAnalysisStore } from "@/store/analysis-store";
import { cn } from "@/lib/utils";

interface UserButtonProps {
  collapsed?: boolean;
}

export function UserButton({ collapsed = false }: UserButtonProps) {
  const { user, isAuthenticated, isLoading, clearAuth } = useAuthStore();
  const { clearCurrent } = useAnalysisStore();
  const [mounted, setMounted] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    plan: 'free' | 'pro' | 'enterprise';
    verified: boolean;
    title?: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      Promise.all([
        fetch('/api/usage/limits').then(res => res.ok ? res.json() : { success: false, plan: 'free' }).catch(() => ({ success: false, plan: 'free' })),
        fetch('/api/user/info').then(res => res.ok ? res.json() : { success: false, user: {} }).catch(() => ({ success: false, user: {} }))
      ])
        .then(([usageData, userData]) => {
          if (usageData.success && userData.success) {
            setSubscriptionInfo({
              plan: usageData.plan || 'free',
              verified: userData.user?.verified || false,
              title: userData.user?.title,
            });
          } else {
            // Fallback to free plan if API fails
            setSubscriptionInfo({
              plan: 'free',
              verified: false,
              title: undefined,
            });
          }
        })
        .catch(() => {
          // Silently handle error - use fallback values
          setSubscriptionInfo({
            plan: 'free',
            verified: false,
            title: undefined,
          });
        });
    }
  }, [isAuthenticated, user]);

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

  if (!mounted) {
    return (
      <button className={cn(
        "relative flex items-center rounded-lg bg-linear-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 hover:border-blue-500/50 transition-all group",
        collapsed ? "w-10 h-10 justify-center p-0" : "w-full gap-3 p-2"
      )}>
        <Avatar className={cn("shrink-0", collapsed ? "h-10 w-10" : "h-8 w-8")}>
          {user.image ? (
            <AvatarImage src={user.image} alt={userName} />
          ) : null}
          <AvatarFallback className="bg-linear-to-br from-blue-600 to-purple-600 text-white text-xs">
            {collapsed && subscriptionInfo?.plan === 'enterprise' ? 'E' : userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
          </AvatarFallback>
        </Avatar>
      </button>
    );
  }

  // Если сайдбар свёрнут, показываем только аватар с иконкой "E" для Enterprise
  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative w-10 h-10 flex items-center justify-center rounded-lg bg-linear-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 hover:border-blue-500/50 transition-all group">
            <Avatar className="h-10 w-10 shrink-0">
              {user.image ? (
                <AvatarImage src={user.image} alt={userName} />
              ) : null}
              <AvatarFallback className="bg-linear-to-br from-blue-600 to-purple-600 text-white text-sm font-semibold">
                {subscriptionInfo?.plan === 'enterprise' ? 'E' : userInitials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-neutral-900 border-neutral-800" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium leading-none text-white">{user.name}</p>
                {subscriptionInfo?.verified && (
                  <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
                )}
              </div>
              {subscriptionInfo && (
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-2 py-0.5 border-none ${
                      subscriptionInfo.plan === 'enterprise' 
                        ? 'bg-linear-to-r from-purple-600/20 to-pink-600/20 text-purple-300' 
                        : subscriptionInfo.plan === 'pro'
                        ? 'bg-linear-to-r from-blue-600/20 to-purple-600/20 text-blue-300'
                        : 'bg-neutral-800/50 text-neutral-400'
                    }`}
                  >
                    {subscriptionInfo.plan === 'enterprise' && <Crown className="h-3 w-3 mr-1" />}
                    {subscriptionInfo.plan === 'pro' && <Sparkles className="h-3 w-3 mr-1" />}
                    {subscriptionInfo.plan === 'enterprise' ? 'Enterprise' : subscriptionInfo.plan === 'pro' ? 'Pro' : 'Free'} Plan
                  </Badge>
                  {subscriptionInfo.title && (
                    <span className="text-xs text-neutral-500">
                      {subscriptionInfo.title}
                    </span>
                  )}
                </div>
              )}
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative w-full flex items-center gap-3 p-2 rounded-lg bg-linear-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 hover:border-blue-500/50 transition-all group">
          <Avatar className="h-8 w-8 shrink-0">
            {user.image ? (
              <AvatarImage src={user.image} alt={userName} />
            ) : null}
            <AvatarFallback className="bg-linear-to-br from-blue-600 to-purple-600 text-white text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
                {userName}
              </p>
              {subscriptionInfo?.verified && (
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {subscriptionInfo && (
                <Badge 
                  variant="outline" 
                  className={`text-[10px] px-1.5 py-0 border-none ${
                    subscriptionInfo.plan === 'enterprise' 
                      ? 'bg-linear-to-r from-purple-600/20 to-pink-600/20 text-purple-300' 
                      : subscriptionInfo.plan === 'pro'
                      ? 'bg-linear-to-r from-blue-600/20 to-purple-600/20 text-blue-300'
                      : 'bg-neutral-800/50 text-neutral-400'
                  }`}
                >
                  {subscriptionInfo.plan === 'enterprise' && <Crown className="h-2.5 w-2.5 mr-0.5" />}
                  {subscriptionInfo.plan === 'pro' && <Sparkles className="h-2.5 w-2.5 mr-0.5" />}
                  {subscriptionInfo.plan === 'enterprise' ? 'Enterprise' : subscriptionInfo.plan === 'pro' ? 'Pro' : 'Free'}
                </Badge>
              )}
              {subscriptionInfo?.title && (
                <span className="text-[10px] text-neutral-500 truncate">
                  {subscriptionInfo.title}
                </span>
              )}
            </div>
            {user.email && (
              <p className="text-xs text-neutral-400 truncate mt-0.5">
                {user.email}
              </p>
            )}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-neutral-900 border-neutral-800" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none text-white">{user.name}</p>
              {subscriptionInfo?.verified && (
                <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
              )}
            </div>
            {subscriptionInfo && (
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`text-xs px-2 py-0.5 border-none ${
                    subscriptionInfo.plan === 'enterprise' 
                      ? 'bg-linear-to-r from-purple-600/20 to-pink-600/20 text-purple-300' 
                      : subscriptionInfo.plan === 'pro'
                      ? 'bg-linear-to-r from-blue-600/20 to-purple-600/20 text-blue-300'
                      : 'bg-neutral-800/50 text-neutral-400'
                  }`}
                >
                  {subscriptionInfo.plan === 'enterprise' && <Crown className="h-3 w-3 mr-1" />}
                  {subscriptionInfo.plan === 'pro' && <Sparkles className="h-3 w-3 mr-1" />}
                  {subscriptionInfo.plan === 'enterprise' ? 'Enterprise' : subscriptionInfo.plan === 'pro' ? 'Pro' : 'Free'} Plan
                </Badge>
                {subscriptionInfo.title && (
                  <span className="text-xs text-neutral-500">
                    {subscriptionInfo.title}
                  </span>
                )}
              </div>
            )}
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

