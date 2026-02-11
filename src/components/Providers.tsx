'use client';

import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ToastContainerWrapper() {
  const { resolvedTheme } = useTheme();
  return (
    <ToastContainer
      pauseOnFocusLoss
      theme={resolvedTheme}
      limit={5}
    />
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
        <ToastContainerWrapper />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

