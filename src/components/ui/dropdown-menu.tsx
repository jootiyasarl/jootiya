"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DropdownMenuContext =
  React.createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext() {
  const ctx = React.useContext(DropdownMenuContext);
  if (!ctx) {
    throw new Error(
      "DropdownMenu components must be used within <DropdownMenu>",
    );
  }
  return ctx;
}

export interface DropdownMenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function DropdownMenu({
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  children,
}: DropdownMenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    defaultOpen ?? false,
  );

  const open = controlledOpen ?? uncontrolledOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );

  const value = React.useMemo<DropdownMenuContextValue>(
    () => ({ open, setOpen }),
    [open, setOpen],
  );

  return (
    <DropdownMenuContext.Provider value={value}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

export interface DropdownMenuTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>(({ className, children, ...props }, ref) => {
  const { open, setOpen } = useDropdownMenuContext();

  return (
    <button
      ref={ref}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export interface DropdownMenuContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(({ className, children, ...props }, ref) => {
  const { open } = useDropdownMenuContext();

  if (!open) return null;

  return (
    <div
      ref={ref}
      role="menu"
      className={cn(
        "relative z-50 mt-1 min-w-[8rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
DropdownMenuContent.displayName = "DropdownMenuContent";

export interface DropdownMenuItemProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuItemProps
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    role="menuitem"
    className={cn(
      "flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
      className,
    )}
    {...props}
  >
    {children}
  </div>
));
DropdownMenuItem.displayName = "DropdownMenuItem";

export interface DropdownMenuLabelProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  DropdownMenuLabelProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground", className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

export interface DropdownMenuSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  DropdownMenuSeparatorProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export interface DropdownMenuShortcutProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

export const DropdownMenuShortcut = React.forwardRef<
  HTMLSpanElement,
  DropdownMenuShortcutProps
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
    {...props}
  />
));
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
