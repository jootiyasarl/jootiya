"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border bg-card text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    />
  ),
);

Card.displayName = "Card";

export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-3.5 pb-3.5 pt-3", className)}
      {...props}
    />
  ),
);

CardContent.displayName = "CardContent";

export interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col gap-1 px-3.5 pt-3", className)}
      {...props}
    />
  ),
);

CardHeader.displayName = "CardHeader";

export interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-between gap-2 px-3.5 pb-3.5", className)}
      {...props}
    />
  ),
);

CardFooter.displayName = "CardFooter";
