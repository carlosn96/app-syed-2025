
"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface PageNavItem {
    id: string;
    label: string;
    isActive: boolean;
    onSelect: () => void;
}

interface PageNavigationContextType {
  pageNav: PageNavItem[];
  setPageNav: React.Dispatch<React.SetStateAction<PageNavItem[]>>;
  title: string | null;
  setTitle: React.Dispatch<React.SetStateAction<string | null>>;
}

const PageNavigationContext = createContext<PageNavigationContextType | undefined>(undefined);

export const PageNavigationProvider = ({ children }: { children: ReactNode }) => {
  const [pageNav, setPageNav] = useState<PageNavItem[]>([]);
  const [title, setTitle] = useState<string | null>(null);

  const value = { pageNav, setPageNav, title, setTitle };

  return (
    <PageNavigationContext.Provider value={value}>
      {children}
    </PageNavigationContext.Provider>
  );
};

export const usePageNavigation = () => {
  const context = useContext(PageNavigationContext);
  if (context === undefined) {
    throw new Error('usePageNavigation must be used within a PageNavigationProvider');
  }
  return context;
};
