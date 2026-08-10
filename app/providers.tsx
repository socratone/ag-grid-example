"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AllCommunityModule } from "ag-grid-community";
import { AgGridProvider } from "ag-grid-react";
import { useState, type ReactNode } from "react";

const agGridModules = [AllCommunityModule];

const Providers = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 60_000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AgGridProvider modules={agGridModules}>{children}</AgGridProvider>
    </QueryClientProvider>
  );
};

export default Providers;
