
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 h-full border-2 border-dashed border-muted/50 rounded-xl bg-muted/10 animate-in fade-in-50 duration-500">
      <div className="p-4 rounded-full bg-muted/50 mb-4 animate-in zoom-in-50 duration-700">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="font-display text-lg font-semibold mb-2 animate-in slide-in-from-bottom-2 duration-700">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-md animate-in slide-in-from-bottom-3 duration-700">{message}</p>
      {action && (
        <div className="mt-6 animate-in slide-in-from-bottom-4 duration-700">
          {action}
        </div>
      )}
    </div>
  );
}
