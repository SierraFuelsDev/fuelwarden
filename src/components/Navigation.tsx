"use client";

import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { useState } from "react";
import { usePathname } from "next/navigation";

export function Navigation() {
  const { user, isAuthenticated, signOut, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const pathname = usePathname();

  if (loading) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  const handleQuickAction = (action: string) => {
    setIsQuickActionsOpen(false);
    // Handle different quick actions
    switch (action) {
      case 'log-meal':
        // Navigate to meal log or open meal logging modal
        break;
      case 'add-activity':
        // Navigate to activity page or open activity modal
        break;
      case 'adjust-schedule':
        // Navigate to schedule page or open schedule modal
        break;
    }
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="w-full bg-[#232325] border-b border-[#333] shadow-lg fixed top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#ff8e01] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="text-white font-bold text-xl">FuelWarden</span>
            </Link>

            {/* User Menu / Auth Button */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="relative">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-[#333] px-3 py-2 rounded-lg"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-[#ff8e01] rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <span className="hidden sm:block text-sm">
                        {user?.name || user?.email}
                      </span>
                    </div>
                  </Button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#232325] border border-[#333] rounded-lg shadow-lg z-50">
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#333] hover:text-white"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Profile Settings
                        </Link>
                        <button
                          onClick={() => {
                            signOut();
                            setIsMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#333] hover:text-white"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth">
                  <Button className="bg-[#ff8e01] hover:bg-[#ff9e2b] text-white">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation for All Screens */}
      {isAuthenticated && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#232325] border-t border-[#333] shadow-lg z-50 flex justify-center items-center">
          <div className="relative flex justify-between items-center w-full max-w-md mx-auto h-16 px-8">
            <Link
              href="/dashboard"
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                isActive('/dashboard') ? 'text-[#ff8e01]' : 'text-gray-400'
              }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </Link>

            {/* Quick Actions Button - floating and centered */}
            <div className="absolute left-1/2 transform -translate-x-1/2 -top-6 z-10">
              <button
                onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                className="w-14 h-14 bg-[#ff8e01] hover:bg-[#ff9e2b] rounded-full flex items-center justify-center shadow-lg border-4 border-[#232325] focus:outline-none transition-colors"
                aria-label="Quick Actions"
              >
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>

              {/* Quick Actions Popup */}
              {isQuickActionsOpen && (
                <div className="absolute bottom-full mb-4 left-1/2 transform -translate-x-1/2 w-64 bg-[#232325] border border-[#333] rounded-lg shadow-lg z-50">
                  <div className="p-4">
                    <h3 className="text-white font-semibold mb-3 text-center">Quick Actions</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleQuickAction('log-meal')}
                        className="w-full flex items-center space-x-3 p-3 text-left text-gray-300 hover:bg-[#333] hover:text-white rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span>Log Meal</span>
                      </button>
                      <button
                        onClick={() => handleQuickAction('add-activity')}
                        className="w-full flex items-center space-x-3 p-3 text-left text-gray-300 hover:bg-[#333] hover:text-white rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Add Activity</span>
                      </button>
                      <button
                        onClick={() => handleQuickAction('adjust-schedule')}
                        className="w-full flex items-center space-x-3 p-3 text-left text-gray-300 hover:bg-[#333] hover:text-white rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Adjust Schedule</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/mealPlan"
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                isActive('/mealPlan') ? 'text-[#ff8e01]' : 'text-gray-400'
              }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </Link>
          </div>
        </nav>
      )}

      {/* Spacer for fixed navigation */}
      <div className="h-16"></div>
      {isAuthenticated && <div className="h-16"></div>}

      {/* Backdrop for quick actions popup */}
      {isQuickActionsOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsQuickActionsOpen(false)}
        />
      )}
    </>
  );
} 