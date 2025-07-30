
"use client"

import React, { useEffect, useState } from 'react';

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({ value, size = 100, strokeWidth = 10 }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate the progress value
    const animation = requestAnimationFrame(() => setProgress(value));
    return () => cancelAnimationFrame(animation);
  }, [value]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const getColor = () => {
    if (value < 60) return 'hsl(var(--destructive))'; 
    if (value < 80) return 'hsl(var(--warning))'; 
    return 'hsl(var(--success))'; 
  };
  
  const color = getColor();

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          className="text-muted"
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="transition-all duration-700 ease-out"
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-white" style={{ color: 'hsl(var(--foreground))' }}>
          {Math.round(value)}%
        </span>
      </div>
    </div>
  );
};
