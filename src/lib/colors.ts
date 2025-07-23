/**
 * FuelWarden Color System
 * 
 * This file provides easy access to the app's color system.
 * All colors are defined as CSS custom properties in globals.css
 * and can be used with Tailwind classes or CSS variables.
 */

export const colors = {
  // Primary Brand Colors
  primary: {
    main: '#FF5001',
    light: '#FF6B2A',
    dark: '#E04500',
  },
  
  // Background Colors
  background: {
    light: '#FFFFFF',
    dark: '#0A0A0A',
    secondary: '#191919',
  },
  
  // Text Colors
  text: {
    primary: {
      light: '#0A0A0A',
      dark: '#FFFFFF',
    },
    secondary: {
      light: '#6B7280',
      dark: '#9CA3AF',
    },
  },
  
  // UI Colors
  ui: {
    card: {
      light: '#FFFFFF',
      dark: '#191919',
    },
    border: {
      light: '#E5E7EB',
      dark: '#374151',
    },
    muted: {
      light: '#F5F5F5',
      dark: '#191919',
    },
  },
  
  // Semantic Colors
  semantic: {
    destructive: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  
  // Chart Colors
  chart: {
    primary: '#FF5001',
    secondary: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    purple: '#8B5CF6',
  },
} as const;

/**
 * CSS Custom Properties for direct use in CSS
 */
export const cssVariables = {
  '--fuel-orange': '#FF5001',
  '--fuel-orange-light': '#FF6B2A',
  '--fuel-orange-dark': '#E04500',
  '--background-dark': '#0A0A0A',
  '--background-secondary': '#191919',
} as const;

/**
 * Tailwind color classes that can be used directly
 */
export const tailwindClasses = {
  // Primary colors
  'bg-primary': 'bg-[#FF5001]',
  'text-primary': 'text-[#FF5001]',
  'border-primary': 'border-[#FF5001]',
  
  // Background colors
  'bg-dark': 'bg-[#0A0A0A]',
  'bg-dark-secondary': 'bg-[#191919]',
  
  // Text colors
  'text-white': 'text-white',
  'text-dark': 'text-[#0A0A0A]',
} as const;

/**
 * Helper function to get CSS variable value
 */
export function getCssVariable(variableName: string): string {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(variableName)
      .trim();
  }
  return '';
}

/**
 * Color utility functions
 */
export const colorUtils = {
  /**
   * Get the primary brand color
   */
  getPrimary: () => colors.primary.main,
  
  /**
   * Get background color based on theme
   */
  getBackground: (isDark: boolean = false) => 
    isDark ? colors.background.dark : colors.background.light,
  
  /**
   * Get text color based on theme
   */
  getTextColor: (isDark: boolean = false) => 
    isDark ? colors.text.primary.dark : colors.text.primary.light,
  
  /**
   * Get card background color based on theme
   */
  getCardBackground: (isDark: boolean = false) => 
    isDark ? colors.ui.card.dark : colors.ui.card.light,
} as const; 