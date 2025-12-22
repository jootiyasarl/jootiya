"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SelectContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  value?: string;
  setValue: (value: string) => void;
};

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext() {
  const ctx = React.useContext(SelectContext);
  if (!ctx) {
    throw new Error("Select components must be used within <Select>");
  }
  return ctx;
}

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export function Select({
  value,
  defaultValue,
  onValueChange,
  children,
}: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState<string | undefined>(
    defaultValue,
  );

  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = React.useCallback(
    (next: string) => {
      if (value === undefined) {
        setInternalValue(next);
      }
      onValueChange?.(next);
      setOpen(false);
    },
    [onValueChange, value],
  );

  const ctx = React.useMemo<SelectContextValue>(
    () => ({
      open,
      setOpen,
      value: currentValue,
      setValue: handleChange,
    }),
    [open, currentValue, handleChange],
  );

  return <SelectContext.Provider value={ctx}>{children}</SelectContext.Provider>;
}

export interface SelectTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  SelectTriggerProps
>(({ className, children, ...props }, ref) => {
  const { open, setOpen } = useSelectContext();

  return (
    <button
      ref={ref}
      type="button"
      aria-haspopup="listbox"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

export interface SelectContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const SelectContent = React.forwardRef<
  HTMLDivElement,
  SelectContentProps
>(({ className, children, ...props }, ref) => {
  const { open } = useSelectContext();

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "relative z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        className,
      )}
      role="listbox"
      {...props}
    >
      {children}
    </div>
  );
});
SelectContent.displayName = "SelectContent";

export interface SelectItemProps
  extends React.LiHTMLAttributes<HTMLLIElement> {
  value: string;
}

export const SelectItem = React.forwardRef<HTMLLIElement, SelectItemProps>(
  ({ className, children, value, ...props }, ref) => {
    const { setValue, value: selectedValue } = useSelectContext();
    const isSelected = selectedValue === value;

    return (
      <li
        ref={ref}
        role="option"
        aria-selected={isSelected}
        className={cn(
          "flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
          isSelected && "bg-accent text-accent-foreground",
          className,
        )}
        onClick={() => setValue(value)}
        {...props}
      >
        {children ?? value}
      </li>
    );
  },
);
SelectItem.displayName = "SelectItem";

export interface SelectValueProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string;
}

export const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ className, placeholder, ...props }, ref) => {
    const { value } = useSelectContext();

    return (
      <span
        ref={ref}
        className={cn(
          "flex-1 text-left text-sm",
          !value && "text-muted-foreground",
          className,
        )}
        {...props}
      >
        {value ?? placeholder}
      </span>
    );
  },
);
SelectValue.displayName = "SelectValue";
