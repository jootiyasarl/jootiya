"use client";

import type { ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  loadingLabel?: string;
}

export function SubmitButton({
  label,
  loadingLabel = "Please wait...",
  className,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className={className}
      aria-disabled={pending || props.disabled}
      disabled={pending || props.disabled}
      {...props}
    >
      {pending ? loadingLabel : label}
    </Button>
  );
}
