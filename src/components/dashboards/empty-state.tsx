
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
}

export function EmptyState({ icon: Icon, title, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 h-full border-2 border-dashed border-muted rounded-xl">
      <Icon className="h-10 w-10 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-muted-foreground mt-2 text-sm">{message}</p>
    </div>
  );
}
