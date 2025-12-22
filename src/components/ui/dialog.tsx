"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type DialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const ctx = React.useContext(DialogContext);
  if (!ctx) {
    throw new Error("Dialog components must be used within <Dialog>");
  }
  return ctx;
}

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  children,
}: DialogProps) {
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

  const value = React.useMemo<DialogContextValue>(
    () => ({ open, setOpen }),
    [open, setOpen],
  );

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

export interface DialogTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  DialogTriggerProps
>(({ className, children, ...props }, ref) => {
  const { open, setOpen } = useDialogContext();

  return (
    <button
      ref={ref}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={() => setOpen(true)}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
});
DialogTrigger.displayName = "DialogTrigger";

export interface DialogContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogContent = React.forwardRef<
  HTMLDivElement,
  DialogContentProps
>(({ className, children, ...props }, ref) => {
  const { open, setOpen } = useDialogContext();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 text-foreground"
      role="dialog"
      aria-modal="true"
      onClick={() => setOpen(false)}
    >
      <div
        ref={ref}
        className={cn(
          "relative w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg",
          className,
        )}
        onClick={(event) => event.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </div>
  );
});
DialogContent.displayName = "DialogContent";

export interface DialogHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogHeader = ({ className, ...props }: DialogHeaderProps) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

export interface DialogFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogFooter = ({ className, ...props }: DialogFooterProps) => (
  <div
    className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

export interface DialogTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

export const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  DialogTitleProps
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

export interface DialogDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  DialogDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

export interface DialogCloseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const DialogClose = React.forwardRef<
  HTMLButtonElement,
  DialogCloseProps
>(({ className, children, ...props }, ref) => {
  const { setOpen } = useDialogContext();

  return (
    <button
      ref={ref}
      type="button"
      className={className}
      onClick={() => setOpen(false)}
      {...props}
    >
      {children}
    </button>
  );
});
DialogClose.displayName = "DialogClose";
