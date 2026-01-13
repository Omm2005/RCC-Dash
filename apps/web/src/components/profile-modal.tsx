"use client"

import { useActionState, useEffect, useMemo, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Loader2, UploadIcon, User } from "lucide-react"
import { toast } from "sonner"

import { createClient } from "@repo/supabase/client"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dropzone } from "@/components/ui/shadcn-io/dropzone"
import FormSubmitButton from "@/components/form-submit-button"
import { Input } from "@/components/ui/input"
import { updateProfile, type AuthState } from "@/lib/actions"

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

const AVATAR_BUCKET = "avatars"

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
  const [avatarUrl, setAvatarUrl] = useState(user.avatar)
  const [avatarPreview, setAvatarPreview] = useState(user.avatar)
  const [isUploading, setIsUploading] = useState(false)
  const [state, formAction] = useActionState(updateProfile, initialState)
  const isControlled = typeof open !== "undefined"
  const dialogOpen = isControlled ? open : internalOpen
  const setDialogOpen = isControlled ? onOpenChange ?? (() => {}) : setInternalOpen
  const roleLabel = useMemo(() => formatRoleLabel(role), [role])

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
    setAvatarUrl(user.avatar)
    setAvatarPreview(user.avatar)
  }, [user.avatar])

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

  const showFallbackIcon = !avatarPreview
  const initials = getInitials(user.name)
  const previousAvatarUrl = avatarUrl

  const handleAvatarDrop = async (files: File[]) => {
    const file = files[0]
    if (!file) {
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setAvatarPreview(objectUrl)
    setIsUploading(true)

    try {
      const supabase = createClient()
      const fileExt = file.name.split(".").pop() || "png"
      const userKey =
        user.id ||
        user.email.replace(/[^a-z0-9]+/gi, "-").toLowerCase() ||
        "user"
      const filePath = `avatars/${userKey}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type || "image/png",
        })

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(filePath)

      if (!data.publicUrl) {
        throw new Error("Unable to get a public URL for the avatar.")
      }

      setAvatarUrl(data.publicUrl)
      setAvatarPreview(data.publicUrl)
      toast.success("Avatar uploaded.")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to upload avatar."
      toast.error(message)
      setAvatarPreview(previousAvatarUrl)
    } finally {
      setIsUploading(false)
      URL.revokeObjectURL(objectUrl)
    }
  }

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {children ? <AlertDialogTrigger asChild>{children}</AlertDialogTrigger> : null}
      <AlertDialogContent className="sm:max-w-xl">
        <AlertDialogHeader className="place-items-start text-left">
          <AlertDialogTitle>Profile</AlertDialogTitle>
          <AlertDialogDescription>
            Update your display name and avatar. Changes appear across the dashboard.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form action={formAction} className="grid gap-5">
          <div className="flex items-center gap-4">
            <Avatar className="size-12" size="lg">
              {avatarPreview ? (
                <AvatarImage src={avatarPreview} alt={user.name} />
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
              <p className="text-xs text-muted-foreground">{user.email || "No email on file"}</p>
            </div>
          </div>
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium">
              Display name
              <Input
                name="displayName"
                defaultValue={user.name}
                autoComplete="name"
                required
              />
            </label>
            <div className="grid gap-2 text-sm font-medium">
              Avatar upload
              <Dropzone
                accept={{ "image/*": [] }}
                maxFiles={1}
                maxSize={5 * 1024 * 1024}
                onDrop={(files) => void handleAvatarDrop(files)}
                onError={(error) => toast.error(error.message)}
                disabled={isUploading}
                className="border-dashed p-4 whitespace-normal"
              >
                <div className="flex w-full items-center gap-3 text-left">
                  <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="h-full w-full object-cover rounded-full aspect-square"
                      />
                    ) : (
                      <UploadIcon size={20} className="text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {isUploading ? "Uploading avatar..." : "Drag and drop an image"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isUploading
                        ? "Please wait while we upload your file."
                        : "PNG or JPG up to 5MB. Click to browse."}
                    </p>
                  </div>
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : null}
                </div>
              </Dropzone>
            </div>
            <label className="grid gap-2 text-sm font-medium">
              Avatar URL
              <Input
                type="url"
                name="avatarUrl"
                value={avatarUrl}
                autoComplete="url"
                placeholder="https://example.com/avatar.png"
                onChange={(event) => {
                  setAvatarUrl(event.target.value)
                  setAvatarPreview(event.target.value)
                }}
              />
            </label>
          </div>
          <div className="rounded-lg border p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Role</span>
              <Badge variant="outline">{roleLabel}</Badge>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="max-w-[60%] truncate text-right">{user.email || "-"}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted-foreground">Member since</span>
              <span>{joinedLabel}</span>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <FormSubmitButton disabled={isUploading} pendingText="Saving...">
              Save changes
            </FormSubmitButton>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
