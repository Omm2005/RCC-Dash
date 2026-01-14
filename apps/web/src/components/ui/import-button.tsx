"use client"; 
import { Button } from "@/components/ui/button";

type ImportButtonProps = {
  onClick: () => void;
  disabled?: boolean;
}

export function ImportButton({ onClick, disabled }: ImportButtonProps) {
  return (
    <Button 
    onClick={() => {
      console.log("ImportButton clicked");
      onClick();
    }}
      disabled={disabled}
      className="pl-10 pr-10"
    >
      Import Data
    </Button>
  );
};
