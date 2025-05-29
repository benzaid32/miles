/**
 * Polyfills required for React Native + Firebase compatibility
 * Ensures proper functionality across Android and iOS platforms
 */

// URL polyfill needed for Firebase and other network operations
import 'react-native-url-polyfill/auto';

// Patch timers for Android compatibility issues
if (global.setTimeout === undefined) {
  global.setTimeout = setTimeout;
}

if (global.clearTimeout === undefined) {
  global.clearTimeout = clearTimeout;
}

// Fix for atob/btoa (Base64) on Android
if (typeof global.btoa === 'undefined') {
  global.btoa = function (input: string) {
    return Buffer.from(input, 'binary').toString('base64');
  };
}

if (typeof global.atob === 'undefined') {
  global.atob = function (input: string) {
    return Buffer.from(input, 'base64').toString('binary');
  };
}
