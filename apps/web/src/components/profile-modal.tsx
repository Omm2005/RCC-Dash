"use client"

import { useActionState, useEffect, useMemo, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { User } from "lucide-react"
import { toast } from "sonner"

import { HugeiconsIcon } from "@hugeicons/react"
import { Moon02Icon, Sun03Icon, Tv02Icon } from "@hugeicons/core-free-icons"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import FormSubmitButton from "@/components/form-submit-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signOut, updateProfile, type AuthState } from "@/lib/actions"


type ProfileModalProps = {
  user: {
    id?: string
    name: string
    email: string
    avatar: string
    joinedAt?: string | null
  }
  role?: string | null
  children?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const initialState: AuthState = {
  error: undefined,
  success: undefined,
}

const formatRoleLabel = (role?: string | null) => {
  if (!role) return "Member"
  const label = role.replace(/_/g, " ")
  return `${label[0]?.toUpperCase() ?? ""}${label.slice(1)}`
}

const getInitials = (name: string) => {
  const parts = name.trim().split(" ").filter(Boolean)
  if (!parts.length) return ""
  if (parts.length === 1) return parts[0][0] ?? ""
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`
}

export function ProfileModal({
  user,
  role,
  children,
  open,
  onOpenChange,
}: ProfileModalProps) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [displayName, setDisplayName] = useState(user.name)
  const [state, formAction] = useActionState(updateProfile, initialState)
  const isControlled = typeof open !== "undefined"
  const dialogOpen = isControlled ? open : internalOpen
  const setDialogOpen = isControlled ? onOpenChange ?? (() => {}) : setInternalOpen
  const roleLabel = useMemo(() => formatRoleLabel(role), [role])
  const initialName = useMemo(() => user.name.trim(), [user.name])
  const trimmedDisplayName = displayName.trim()
  const isSubmitDisabled =
    trimmedDisplayName.length === 0 || trimmedDisplayName === initialName

  const joinedLabel = useMemo(() => {
    if (!user.joinedAt) return "-"
    const date = new Date(user.joinedAt)
    if (Number.isNaN(date.getTime())) return "-"
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }, [user.joinedAt])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (dialogOpen) {
      setDisplayName(user.name)
    }
  }, [dialogOpen, user.name])

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    }

    if (state?.success) {
      toast.success(state.success)
      setDialogOpen(false)
      router.refresh()
    }
  }, [state?.error, state?.success, router, setDialogOpen])

  const showFallbackIcon = !user.avatar
  const initials = getInitials(user.name)

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription>
            Update your display name!
          </DialogDescription>
        </DialogHeader>
        <form id="profile-form" action={formAction} className="grid gap-5">
          <div className="flex items-center gap-4">
            <Avatar className="size-12" size="lg">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={user.name} />
              ) : null}
              <AvatarFallback>
                {showFallbackIcon ? (
                  <User className="h-5 w-5" />
                ) : (
                  initials || "U"
                )}
              </AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">
                {user.email || "No email on file"}
              </p>
            </div>
          </div>
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium">
              Display name
              <div className="flex justify-between w-full items-center gap-2">
              <Input
                name="displayName"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                autoComplete="name"
                required
                className="w-full"
                />
                 <FormSubmitButton
                   form="profile-form"
                   pendingText="Saving..."
                   disabled={isSubmitDisabled}
                 >
              Save changes
            </FormSubmitButton>
                </div>
            </label>
          </div>
          <div className="rounded-lg border p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Role</span>
              <Badge variant="outline">{roleLabel}</Badge>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="max-w-[60%] truncate text-right">
                {user.email || "-"}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted-foreground">Member since</span>
              <span>{joinedLabel}</span>
            </div>
          </div>
        </form>
        <DialogFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form action={signOut} className="w-full sm:w-auto">
            <Button type="submit" variant="outline" className="w-full sm:w-auto">
              Sign out
            </Button>
          </form>
          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
