export const COLORS = {
  // Primary brand colors
  primary: '#64748B',     // Soft blue-grey - emotional safety, understanding
  primaryLight: '#94A3B8', // Lighter variant of primary
  primaryDark: '#475569',  // Darker variant of primary
  
  // Functional colors
  white: '#FEFEFE',       // Clean white - clarity, hope, gentle strength
  background: '#F1F5F9',   // Light background - peaceful, non-threatening
  subtleWarmth: '#FEF3C7', // Subtle warmth - only for gentle positive moments
  
  // UI colors
  gray: '#9CA3AF',        // For secondary text
  lightGray: '#E5E7EB',    // For borders and separators
  dark: '#334155',         // For primary text
  error: '#EF4444',        // For error states and destructive actions
  
  // Legacy colors (maintained for backward compatibility)
  teal: '#64748B',         // Mapped to primary for compatibility
  coral: '#94A3B8',        // Mapped to primaryLight for compatibility
  navy: '#334155',         // Mapped to dark for compatibility
  tealLight: '#94A3B8',    // Mapped to primaryLight for compatibility
};

export const SPACING = {
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
  xxlarge: 48,
};

export const SIZES = {
  xxsmall: 4,
  xsmall: 8,
  small: 12,
  medium: 16,
  large: 20,
  xlarge: 24,
  xxlarge: 32,
  xxxlarge: 40,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const FONTS = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semiBold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
};