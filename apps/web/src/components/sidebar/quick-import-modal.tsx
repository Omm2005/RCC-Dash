"use client"

import { AddCircleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { DropdownMenuDemo } from "@/components/ui/drop-down"
import { ImportButton } from "@/components/ui/import-button"
import UploadArea from "@/components/ui/csvupload"

export function QuickImportModal() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="text-sm font-medium min-w-full duration-200 ease-linear flex justify-start items-center gap-2"
        >
          <HugeiconsIcon icon={AddCircleIcon} />
          <span>Quick Import</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-xl gap-4">
        <AlertDialogHeader className="place-items-start text-left">
          <AlertDialogTitle>Quick Import</AlertDialogTitle>
          <AlertDialogDescription>
            Upload a CSV without leaving the dashboard.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-4 rounded-lg border bg-muted/20 p-4">
          <div className="grid gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Step 1
            </p>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-muted-foreground">Dataset</p>
              <DropdownMenuDemo />
            </div>
          </div>

          <div className="grid gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Step 2
            </p>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-muted-foreground">Upload</p>
              <UploadArea variant="compact" />
            </div>
          </div>
        </div>

        <AlertDialogFooter className="sm:justify-end">
          <AlertDialogCancel variant="ghost">Cancel</AlertDialogCancel>
          <ImportButton />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
