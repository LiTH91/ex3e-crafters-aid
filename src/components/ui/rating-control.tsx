"use client";

import { cn } from "@/lib/utils";

interface RatingControlProps {
  value: number;
  max: number;
  onValueChange: (value: number) => void;
}

export function RatingControl({ value, max, onValueChange }: RatingControlProps) {
  return (
    <div className="flex items-center space-x-1">
      {[...Array(max)].map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onValueChange(i + 1)}
          className={cn(
            "w-6 h-6 rounded-full border-2 transition-colors",
            i < value
              ? "bg-primary border-primary-foreground"
              : "bg-background hover:bg-primary/20"
          )}
          aria-label={`Set rating to ${i + 1}`}
        />
      ))}
    </div>
  );
}
