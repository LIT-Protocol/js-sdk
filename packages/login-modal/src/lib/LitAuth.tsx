import type { ReactNode } from 'react';

import { useOptionalLitAuth } from './LitAuthContext';

export function LitAuth({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}): ReactNode {
  const auth = useOptionalLitAuth();
  if (!auth?.isAuthenticated) return fallback;
  return children;
}
