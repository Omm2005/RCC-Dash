"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button, type ButtonProps } from "./ui/button";

type Props = ButtonProps & {
  pendingText?: string;
};

const FormSubmitButton = ({
  pendingText = "Submitting...",
  children,
  ...buttonProps
}: Props) => {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} {...buttonProps}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? pendingText : children}
    </Button>
  );
};

export default FormSubmitButton;
