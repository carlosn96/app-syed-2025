
import * as React from "react"

import { cn } from "@/lib/utils"
import useToast from "@/hooks/use-toast"
import { Toast, ToastProvider } from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    (<ToastProvider>
      {toasts.map(function ({ id, message, type }) {
        return (
          (<Toast key={id} variant={type === 'error' ? 'destructive' : 'default'}>
            <div className="grid gap-1">
              <p>{message}</p>
            </div>
          </Toast>)
        );
      })}
    </ToastProvider>)
  );
}
