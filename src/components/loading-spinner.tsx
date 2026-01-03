"use client"

export const LoadingSpinner = () => (
  <div className="flex h-screen w-full items-center justify-center login-background">
    <div className="animate-pulse flex h-16 w-16 items-center justify-center rounded-full bg-primary/50">
      <div className="h-8 w-8 rounded-full bg-primary/80"></div>
    </div>
  </div>
);
