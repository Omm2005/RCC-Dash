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
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

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
import { updateUserRole } from "@/lib/actions"
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

const ROLE_OPTIONS = [
  { value: "member", label: "Member" },
  { value: "admin", label: "Admin" },
] as const

type NewUserFormState = {
  name: string
  email: string
  role: (typeof ROLE_OPTIONS)[number]["value"]
}

type UsersTableProps = {
  data: UserRow[]
}

export default function UsersTable({ data }: UsersTableProps) {
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
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)
  const [newUser, setNewUser] = React.useState<NewUserFormState>({
    name: "",
    email: "",
    role: ROLE_OPTIONS[0].value,
  })

  React.useEffect(() => {
    setTableData(data)
  }, [data])

  const handleAddUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = newUser.name.trim()
    const email = newUser.email.trim().toLowerCase()

    if (!name || !email) {
      toast.error("Name and email are required.")
      return
    }

    const nextUser: UserRow = {
      id: crypto.randomUUID(),
      name,
      email,
      avatar: "",
      role: newUser.role,
      created_at: new Date().toISOString(),
    }

    setTableData((prev) => [nextUser, ...prev])
    setNewUser({ name: "", email: "", role: ROLE_OPTIONS[0].value })
    setAddDialogOpen(false)
    toast.success("User added.")
  }

  const handleAddDialogOpenChange = React.useCallback((open: boolean) => {
    setAddDialogOpen(open)
    if (!open) {
      setNewUser({ name: "", email: "", role: ROLE_OPTIONS[0].value })
    }
  }, [])

  const handleRoleChange = React.useCallback(
    async (userId: string, nextRole: string, currentRole: string) => {
      if (!userId || !nextRole || nextRole === currentRole) {
        return
      }

      setUpdatingRoles((prev) => ({ ...prev, [userId]: true }))
      const result = await updateUserRole(userId, nextRole)

      if (result?.error) {
        toast.error(result.error)
      } else {
        setTableData((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, role: nextRole } : user
          )
        )
        toast.success(result?.success ?? "Role updated.")
      }

      setUpdatingRoles((prev) => {
        const next = { ...prev }
        delete next[userId]
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

  const handleDeleteConfirm = React.useCallback(() => {
    if (!deleteTarget) return
    setTableData((prev) => prev.filter((user) => user.id !== deleteTarget.id))
    toast.success("User deleted.")
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
          >
            Name
            <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => {
          const name = row.getValue("name") as string
          return (
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={row.original.avatar || undefined} alt={name} />
                <AvatarFallback>{getInitials(name)}</AvatarFallback>
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
          >
            Email
            <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="truncate lowercase">{row.getValue("email")}</div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const currentRole = row.original.role || "member"
          const isUpdating = Boolean(updatingRoles[row.original.id])
          return (
            <Select
              value={currentRole}
              onValueChange={(value) =>
                handleRoleChange(row.original.id, value, currentRole)
              }
              disabled={isUpdating}
            >
              <SelectTrigger className="h-8 w-32 capitalize">
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
          )
        },
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created At
            <ArrowUpDown />
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
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(user.id)
                    toast.success("User ID copied to clipboard")
                  }}
                >
                  Copy user ID
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(user.email)
                    toast.success("Email copied to clipboard")
                  }}
                >
                  Copy email
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => handleDeleteRequest(user)}
                >
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
    <div className="w-full space-y-4">
      <form
        onSubmit={handleAddUser}
        className="grid gap-3 rounded-md border bg-muted/30 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,150px)_minmax(0,1fr)_auto] sm:items-end"
      >
        <div className="grid gap-2">
          <label
            htmlFor="new-user-name"
            className="text-xs font-medium text-muted-foreground"
          >
            Name
          </label>
          <Input
            id="new-user-name"
            placeholder="Jane Doe"
            value={newUser.name}
            onChange={(event) =>
              setNewUser((prev) => ({ ...prev, name: event.target.value }))
            }
          />
        </div>
        <div className="grid gap-2">
          <label
            htmlFor="new-user-email"
            className="text-xs font-medium text-muted-foreground"
          >
            Email
          </label>
          <Input
            id="new-user-email"
            type="email"
            placeholder="jane@example.com"
            value={newUser.email}
            onChange={(event) =>
              setNewUser((prev) => ({ ...prev, email: event.target.value }))
            }
          />
        </div>
        <div className="grid gap-2">
          <span className="text-xs font-medium text-muted-foreground">Role</span>
          <Select
            value={newUser.role}
            onValueChange={(value) =>
              setNewUser((prev) => ({
                ...prev,
                role: value as NewUserFormState["role"],
              }))
            }
          >
            <SelectTrigger className="h-9">
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
        <div className="grid gap-2">
          <label
            htmlFor="new-user-avatar"
            className="text-xs font-medium text-muted-foreground"
          >
            Avatar URL
          </label>
          <Input
            id="new-user-avatar"
            type="url"
            placeholder="https://..."
            value={newUser.avatar}
            onChange={(event) =>
              setNewUser((prev) => ({ ...prev, avatar: event.target.value }))
            }
          />
        </div>
        <Button type="submit" className="w-full sm:w-auto">
          Add user
        </Button>
      </form>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Filter emails..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="w-full sm:max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="sm:ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
      <div className="overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  className="h-24 text-center"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex gap-2">
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
      <AlertDialog open={deleteDialogOpen} onOpenChange={handleDeleteOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name ?? "this user"}
              </span>{" "}
              {deleteTarget?.email ? `(${deleteTarget.email})` : ""} from the
              dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
