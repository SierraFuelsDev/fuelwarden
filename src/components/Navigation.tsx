"use client";

import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { useState } from "react";
import { usePathname } from "next/navigation";

export function Navigation() {
  const { user, isAuthenticated, signOut, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Hide navigation on auth page and onboarding page
  if (pathname === '/auth' || pathname === '/onboarding') {
    return null;
  }

  if (loading) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Beta Notification Strip */}
      <div className="w-full bg-orange-500 text-white text-center py-2 text-sm font-medium shadow-md z-[60] fixed top-0 left-0">
        Mobile App releasing soon! Please enjoy our beta version of FuelWarden
        <a
          href="/legal#terms"
          className="ml-2 underline font-semibold hover:text-orange-200 transition-colors"
        >
          Learn more in our terms and conditions
        </a>
      </div>
      {/* Top Navigation Bar */}
      <nav className="w-full bg-sidebar border-b border-sidebar-border shadow-lg fixed top-[40px] z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/mealPlan" className="flex items-center space-x-2">
              <img src="/logo-1.svg" alt="FuelWarden Logo" className="h-8 w-auto" />
              <span className="ml-1 px-2 py-0.5 rounded-full bg-orange-500 text-white text-xs font-semibold align-middle">BETA</span>
            </Link>

            {/* User Menu / Auth Button */}
            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    className="text-sidebar-foreground hover:bg-sidebar-accent px-3 py-2 rounded-lg"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-foreground font-semibold text-sm">
                          {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <span className="hidden sm:block text-sm">
                        {user?.name || user?.email}
                      </span>
                    </div>
                  </Button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-sidebar border border-sidebar-border rounded-lg shadow-lg z-50">
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Profile Settings
                        </Link>
                        <Link
                          href="/legal"
                          className="block px-4 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Policies & Info
                        </Link>
                        <button
                          onClick={() => {
                            signOut();
                            setIsMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Simple Bottom Navigation */}
      {isAuthenticated && (
        <nav className="fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border shadow-lg z-50">
          <div className="flex justify-center items-center w-full h-16">
            <div className="flex w-full max-w-md">
              {/* Meal Plan Tab */}
              <Link
                href="/mealPlan"
                className={`flex flex-col items-center justify-center flex-1 h-16 transition-colors ${
                  isActive('/mealPlan') ? 'text-primary' : 'text-muted-foreground hover:text-sidebar-foreground'
                }`}
              >
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-medium">Plan</span>
              </Link>

              {/* Profile/Settings Tab */}
              <Link
                href="/profile"
                className={`flex flex-col items-center justify-center flex-1 h-16 transition-colors ${
                  isActive('/profile') ? 'text-primary' : 'text-muted-foreground hover:text-sidebar-foreground'
                }`}
              >
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs font-medium">Profile</span>
              </Link>
            </div>
          </div>
        </nav>
      )}

      {/* Spacer for fixed navigation */}
      <div className="h-16"></div>
      {isAuthenticated && <div className="h-16"></div>}
    </>
  );
} 