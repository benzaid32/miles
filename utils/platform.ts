import { Platform, PlatformIOSStatic } from 'react-native';

/**
 * Platform utility functions following enterprise React Native standards
 * Helps create consistent experiences across Android and iOS
 */

// Check if platform is Android
export const isAndroid = Platform.OS === 'android';

// Check if platform is iOS
export const isIOS = Platform.OS === 'ios';

// Check if platform is web
export const isWeb = Platform.OS === 'web';

// Get platform-specific value
export function platformSelect<T>(options: { android?: T; ios?: T; default: T }): T {
  if (isAndroid && options.android !== undefined) {
    return options.android;
  }
  if (isIOS && options.ios !== undefined) {
    return options.ios;
  }
  return options.default;
}

// Android elevation to shadow conversion for cross-platform shadow effects
export function elevationShadowStyle(elevation: number) {
  return {
    elevation,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: elevation / 2 },
    shadowOpacity: 0.3,
    shadowRadius: elevation / 2,
  };
}

// Get correct status bar height based on platform
export function getStatusBarHeight(safe?: boolean): number {
  // Default values
  const STATUS_BAR_HEIGHT = isAndroid ? 24 : 20;
  const NOTCH_HEIGHT = 24;

  if (isIOS) {
    const iOSPlatform = Platform as PlatformIOSStatic;
    if (iOSPlatform.isPad) return STATUS_BAR_HEIGHT;
    return iOSPlatform.isTV ? 0 : safe ? NOTCH_HEIGHT : STATUS_BAR_HEIGHT;
  }
  
  return STATUS_BAR_HEIGHT;
}

// Fix Android keyboard issues
export const androidKeyboardAdjustResize = isAndroid ? { behavior: 'padding', keyboardVerticalOffset: 0 } : {};
