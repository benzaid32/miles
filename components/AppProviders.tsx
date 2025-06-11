import React, { ReactNode } from 'react';
import { AuthProvider } from '../hooks/useAuth';
import ErrorBoundary from './ErrorBoundary';

type AppProvidersProps = {
  children: ReactNode;
};

/**
 * AppProviders combines all context providers in the app
 * Ensures proper nesting order of providers with error boundary protection
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ErrorBoundary>
  );
}
