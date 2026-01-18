"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Search, UserPlus, Trash2, Copy, Mail, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import { addAuthorizedUser, updateUserRole, deleteAuthorizedUser } from "@/lib/actions"
import { toast } from "sonner"

export type UserRow = {
  id: string
  name: string
  email: string
  avatar: string
  role: string
  created_at: string | null
}

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ""
  const second = parts[1]?.[0] ?? ""
  return `${first}${second}`.toUpperCase()
}

const formatDate = (value: string | null) => {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

const getUserKey = (user: UserRow) => user.id || user.email

const ROLE_OPTIONS = [
  { value: "member", label: "Member", variant: "secondary" as const },
  { value: "admin", label: "Admin", variant: "default" as const },
] as const

type NewUserFormState = {
  name: string
  email: string
  role: (typeof ROLE_OPTIONS)[number]["value"]
}

type UsersTableProps = {
  data: UserRow[]
  id: string
}

export default function UsersTable({ data, id }: UsersTableProps) {
  const [tableData, setTableData] = React.useState<UserRow[]>(() => data)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [updatingRoles, setUpdatingRoles] = React.useState<
    Record<string, boolean>
  >({})
  const [deleteTarget, setDeleteTarget] = React.useState<UserRow | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [newUser, setNewUser] = React.useState<NewUserFormState>({
    name: "",
    email: "",
    role: ROLE_OPTIONS[0].value,
  })

  React.useEffect(() => {
    setTableData(data)
  }, [data])

  const handleAddUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = newUser.name.trim()
    const email = newUser.email.trim().toLowerCase()

    if (!name || !email) {
      toast.error("Name and email are required.")
      return
    }

    setIsSubmitting(true)
    const result = await addAuthorizedUser({
      name,
      email,
      role: newUser.role,
    })

    setIsSubmitting(false)

    if (result?.error) {
      toast.error(result.error)
      return
    }

    const nextUser: UserRow = result?.data ?? {
      id: "",
      name,
      email,
      avatar: "",
      role: newUser.role,
      created_at: new Date().toISOString(),
    }

    setTableData((prev) => [nextUser, ...prev])
    setNewUser({ name: "", email: "", role: ROLE_OPTIONS[0].value })
    setAddDialogOpen(false)
    toast.success(result?.success ?? "User added successfully!")
  }

  const handleAddDialogOpenChange = React.useCallback((open: boolean) => {
    setAddDialogOpen(open)
    if (!open) {
      setNewUser({ name: "", email: "", role: ROLE_OPTIONS[0].value })
    }
  }, [])

  const handleRoleChange = React.useCallback(
    async (
      id: string,
      email: string,
      nextRole: string,
      currentRole: string
    ) => {
      if (!nextRole || nextRole === currentRole) {
        return
      }
      
      const key = id || email
      if (!key) {
        return
      }

      setUpdatingRoles((prev) => ({ ...prev, [key]: true }))

      const result = await updateUserRole({
        id: id || undefined,
        email: email || undefined,
        role: nextRole,
      })

      if (result?.error) {
        toast.error(result.error)
      } else {
        setTableData((prev) => {
          const normalizedEmail = email.trim().toLowerCase()
          return prev.map((user) => {
            if (id) {
              return { ...user, role: nextRole }
            }
            if (!id && normalizedEmail && user.email.toLowerCase() === normalizedEmail) {
              return { ...user, role: nextRole }
            }
            return user
          })
        })
        toast.success(result?.success ?? "Role updated successfully!")
      }

      setUpdatingRoles((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    },
    []
  )

  const handleDeleteOpenChange = React.useCallback((open: boolean) => {
    setDeleteDialogOpen(open)
    if (!open) {
      setDeleteTarget(null)
    }
  }, [])

  const handleDeleteRequest = React.useCallback((user: UserRow) => {
    setDeleteTarget(user)
    setDeleteDialogOpen(true)
  }, [])

  const handleDeleteConfirm = React.useCallback(async () => {
    if (!deleteTarget || !deleteTarget.id) {
      return
    }
    
    setIsDeleting(true)
    const result = await deleteAuthorizedUser(deleteTarget.id)
    
    if (result?.error) {
      toast.error(result.error)
      setIsDeleting(false)
      return
    }
    
    const targetKey = getUserKey(deleteTarget)
    setTableData((prev) => prev.filter((user) => getUserKey(user) !== targetKey))
    toast.success(result?.success ?? "User deleted successfully!")
    setIsDeleting(false)
    setDeleteDialogOpen(false)
    setDeleteTarget(null)
  }, [deleteTarget])

  const columns = React.useMemo<ColumnDef<UserRow>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-muted/50"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const name = row.getValue("name") as string
          return (
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                <AvatarImage src={row.original.avatar || undefined} alt={name} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate font-medium">{name}</span>
            </div>
          )
        },
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-muted/50"
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="truncate text-muted-foreground">{row.getValue("email")}</span>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const currentRole = row.original.role || "member"
          const key = getUserKey(row.original)
          const isUpdating = Boolean(updatingRoles[key])
          const canUpdateRole = Boolean(row.original.id || row.original.email)

          return (
            <Select
              value={currentRole}
              onValueChange={(value) =>
                handleRoleChange(
                  row.original.id,
                  row.original.email,
                  value,
                  currentRole
                )
              }
              disabled={isUpdating || !canUpdateRole}
            >
              <SelectTrigger className="h-8 w-27.5 capitalize">
                <SelectValue className="capitalize" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        },
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-muted/50"
          >
            Created At
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="whitespace-nowrap text-sm text-muted-foreground">
            {formatDate(row.getValue("created_at"))}
          </div>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const user = row.original

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    if (!user.id) return
                    navigator.clipboard.writeText(user.id)
                    toast.success("User ID copied!")
                  }}
                  disabled={!user.id}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy user ID
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(user.email)
                    toast.success("Email copied!")
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Copy email
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => handleDeleteRequest(user)}
                  disabled={user.id === id}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete user
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [handleDeleteRequest, handleRoleChange, updatingRoles]
  )

  const table = useReactTable({
    data: tableData,
    columns,
    getRowId: (row) => getUserKey(row),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">Manage your team members and their roles</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={handleAddDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account for your team.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddUser} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label
                  htmlFor="new-user-name"
                  className="text-sm font-medium"
                >
                  Full Name
                </label>
                <Input
                  id="new-user-name"
                  placeholder="Jane Doe"
                  value={newUser.name}
                  onChange={(event) =>
                    setNewUser((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  disabled={isSubmitting}
                  className="h-10"
                />
              </div>
              <div className="grid gap-2">
                <label
                  htmlFor="new-user-email"
                  className="text-sm font-medium"
                >
                  Email Address
                </label>
                <Input
                  id="new-user-email"
                  type="email"
                  placeholder="jane@example.com"
                  value={newUser.email}
                  onChange={(event) =>
                    setNewUser((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                  disabled={isSubmitting}
                  className="h-10"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  Role
                </label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) =>
                    setNewUser((prev) => ({
                      ...prev,
                      role: value as NewUserFormState["role"],
                    }))
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Role</SelectLabel>
                      {ROLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isSubmitting}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add User"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("email")?.setFilterValue(event.target.value)
            }
            className="pl-9 sm:max-w-sm"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              Columns <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-12">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Users className="h-8 w-8" />
                    <p className="text-sm">No users found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={handleDeleteOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name ?? "this user"}
              </span>
              {deleteTarget?.email ? ` (${deleteTarget.email})` : ""} from your team.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
