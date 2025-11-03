
import * as React from "react"

const BREAKPOINTS = {
    sm: 640,
    md: 1024,
    //lg: 1280,
    xl: 1280,
    "2xl": 1536,
}

type Breakpoint = keyof typeof BREAKPOINTS;

export function useIsMobile(breakpoint: Breakpoint = 'md') {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  const bpWidth = BREAKPOINTS[breakpoint];

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mql = window.matchMedia(`(max-width: ${bpWidth - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < bpWidth)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < bpWidth)
    return () => mql.removeEventListener("change", onChange)
  }, [bpWidth])

  return !!isMobile
}
