// Color palette for the app
export const COLORS = {
  primary: '#2196F3',
  secondary: '#1976D2',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#757575',
  lightGray: '#BDBDBD',
  darkGray: '#424242',
  error: '#D32F2F',
  success: '#388E3C',
  background: '#F5F7FA',
  text: {
    primary: '#212121',
    secondary: '#757575'
  }
};

// Typography sizing
export const SIZES = {
  ssmall: 9,
  small: 12,
  medium: 14,
  large: 16,
  xlarge: 18,
  xxlarge: 24,
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Border radius
export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

// Shadow styles
export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  dark: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
};

export default {
  COLORS,
  SIZES,
  SPACING,
  RADIUS,
  SHADOWS,
}; 