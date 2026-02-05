"use client"

import { useCallback, useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Pencil, Trash2 } from "lucide-react"

import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/column-header"
import type { ExportableData } from "@/components/data-table/utils/export-utils"
import { LanguagePicker } from "@/components/language/LanguagePicker"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import userService from "@/services/user.service"
import type { IUser } from "@/types/user.types"
import { UserForm } from "@/app/admin/users/(form)/UserForm"
import toast from "react-hot-toast"

type UserTableRow = ExportableData & IUser

interface UsersFetchParams {
  page: number
  limit: number
  search: string
  from_date: string
  to_date: string
  sort_by: string
  sort_order: "asc" | "desc"
}

type UsersFetchArgs =
  | [UsersFetchParams]
  | [
      number,
      number,
      string,
      { from_date: string; to_date: string },
      string,
      string,
      unknown?,
    ]

export default function AdminUsersPage() {
  const [viewOpen, setViewOpen] = useState(false)
  const [editConfirmOpen, setEditConfirmOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [activeUser, setActiveUser] = useState<IUser | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [refreshToken, setRefreshToken] = useState(0)
  const readOnlyInputProps = {
    readOnly: true,
    tabIndex: -1,
    onFocus: (event: React.FocusEvent<HTMLInputElement>) =>
      event.currentTarget.blur(),
  }
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    []
  )

  const openView = useCallback((user: IUser) => {
    setActiveUser(user)
    setViewOpen(true)
  }, [])

  const openEditConfirm = useCallback((user: IUser) => {
    setActiveUser(user)
    setEditConfirmOpen(true)
  }, [])

  const openDeleteConfirm = useCallback((user: IUser) => {
    setActiveUser(user)
    setDeleteConfirmOpen(true)
  }, [])

  const handleDelete = useCallback(async () => {
    if (!activeUser) return
    try {
      setIsDeleting(true)
      await userService.deleteUser(activeUser.id)
      toast.success("User anonymized")
      setDeleteConfirmOpen(false)
      setActiveUser(null)
      setRefreshToken((value) => value + 1)
    } catch (error) {
      console.error(error)
      toast.error("Failed to anonymize user")
    } finally {
      setIsDeleting(false)
    }
  }, [activeUser])

  const columns = useMemo<ColumnDef<UserTableRow, unknown>[]>(() => [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <span className="font-semibold">{row.original.id}</span>,
      enableSorting: true,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => <span>{row.original.name || "—"}</span>,
      enableSorting: true,
    },
    {
      accessorKey: "lastName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last name" />
      ),
      cell: ({ row }) => <span>{row.original.lastName || "—"}</span>,
      enableSorting: true,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => <span>{row.original.email}</span>,
      enableSorting: true,
    },
    {
      accessorKey: "phone",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
      cell: ({ row }) => <span>{row.original.phone || "—"}</span>,
      enableSorting: true,
    },
    {
      accessorKey: "country",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Country" />
      ),
      cell: ({ row }) => <span>{row.original.country || "—"}</span>,
      enableSorting: true,
    },
    {
      accessorKey: "city",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="City" />
      ),
      cell: ({ row }) => <span>{row.original.city || "—"}</span>,
      enableSorting: true,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Registered" />
      ),
      cell: ({ row }) => {
        const parsed = row.original.createdAt
          ? new Date(row.original.createdAt)
          : null
        return (
          <span className="text-sm text-muted-foreground">
            {parsed && !Number.isNaN(parsed.getTime())
              ? dateFormatter.format(parsed)
              : "—"}
          </span>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated" />
      ),
      cell: ({ row }) => {
        const parsed = row.original.updatedAt
          ? new Date(row.original.updatedAt)
          : null
        return (
          <span className="text-sm text-muted-foreground">
            {parsed && !Number.isNaN(parsed.getTime())
              ? dateFormatter.format(parsed)
              : "—"}
          </span>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: "rights",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => {
        const roles = row.original.rights ?? []
        const label = roles.length > 0 ? roles.join(", ") : "User"
        return <span>{label}</span>
      },
      enableSorting: false,
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => openView(row.original)}
            aria-label="View user"
          >
            <Eye className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => openEditConfirm(row.original)}
            aria-label="Edit user"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => openDeleteConfirm(row.original)}
            aria-label="Delete user"
          >
            <Trash2 className="size-4 text-red-400" />
          </Button>
        </div>
      ),
      enableSorting: false,
    },
  ], [openEditConfirm, openDeleteConfirm, openView])

  const fetchUsers = useCallback(async (...args: UsersFetchArgs) => {
    const params: UsersFetchParams =
      typeof args[0] === "number"
        ? {
            page: args[0],
            limit: args[1] ?? 10,
            search: args[2] ?? "",
            from_date: args[3]?.from_date ?? "",
            to_date: args[3]?.to_date ?? "",
            sort_by: args[4] ?? "id",
            sort_order: args[5] === "asc" ? "asc" : "desc",
          }
        : args[0]

    const response = await userService.fetchUsers({
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      searchTerm: params.search,
      from_date: params.from_date,
      to_date: params.to_date,
    })
    const items = response.data.items ?? []

    const sorted = [...items].sort((a, b) => {
      const key = params.sort_by as keyof IUser
      const dir = params.sort_order === "asc" ? 1 : -1
      const aValue = a[key]
      const bValue = b[key]
      if (aValue == null && bValue == null) return 0
      if (aValue == null) return 1 * dir
      if (bValue == null) return -1 * dir
      return String(aValue).localeCompare(String(bValue)) * dir
    })

    const totalItems =
      response.data.totalCount ?? sorted.length + (response.data.isHasMore ? 1 : 0)

    return {
      success: true,
      data: sorted,
      pagination: {
        page: params.page,
        limit: params.limit,
        total_pages: Math.max(1, Math.ceil(totalItems / params.limit)),
        total_items: totalItems,
      },
    }
  }, [])

  const tableConfig = useMemo(
    () => ({
      enableRowSelection: false,
      enableClickRowSelect: false,
      enableColumnFilters: false,
      enableDateFilter: true,
      enableExport: false,
      enableToolbar: true,
      columnResizingTableId: "admin-users",
      defaultSortBy: "id",
      defaultSortOrder: "desc",
    }),
    []
  )

  const exportConfig = useMemo(
    () => ({
      entityName: "users",
      columnMapping: {
        id: "ID",
        name: "Name",
        lastName: "Last name",
        email: "Email",
        phone: "Phone",
        country: "Country",
        city: "City",
        createdAt: "Registered",
        updatedAt: "Updated",
        rights: "Role",
      },
      columnWidths: [
        { wch: 10 },
        { wch: 16 },
        { wch: 16 },
        { wch: 28 },
        { wch: 16 },
        { wch: 16 },
        { wch: 16 },
        { wch: 14 },
        { wch: 14 },
        { wch: 18 },
      ],
      headers: [
        "ID",
        "Name",
        "Last name",
        "Email",
        "Phone",
        "Country",
        "City",
        "Registered",
        "Updated",
        "Role",
      ],
    }),
    []
  )

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Users</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto">
          <LanguagePicker inline />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage platform users.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DataTable
              config={tableConfig}
              getColumns={() => columns}
              fetchDataFn={fetchUsers}
              exportConfig={exportConfig}
              idField="id"
              pageSizeOptions={[10, 20, 50]}
              keepPreviousData
              refreshToken={refreshToken}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={viewOpen} onOpenChange={setViewOpen} modal={false}>
        <DialogContent className="border border-white/10 bg-black/60 text-white backdrop-blur-md sm:max-w-xl md:left-[calc(50%+8rem)]">
          <DialogHeader>
            <DialogTitle>User details</DialogTitle>
            <DialogDescription>
              Profile overview for the selected user.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div className="space-y-1">
              <span className="text-muted-foreground">ID</span>
              <Input value={activeUser?.id ?? "—"} {...readOnlyInputProps} />
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Name</span>
              <Input value={activeUser?.name || "—"} {...readOnlyInputProps} />
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Last name</span>
              <Input value={activeUser?.lastName || "—"} {...readOnlyInputProps} />
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Email</span>
              <Input value={activeUser?.email || "—"} {...readOnlyInputProps} />
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Phone</span>
              <Input value={activeUser?.phone || "—"} {...readOnlyInputProps} />
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Country</span>
              <Input value={activeUser?.country || "—"} {...readOnlyInputProps} />
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">City</span>
              <Input value={activeUser?.city || "—"} {...readOnlyInputProps} />
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Role</span>
              <Input
                value={
                  activeUser?.rights?.length ? activeUser.rights.join(", ") : "User"
                }
                {...readOnlyInputProps}
              />
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Registered</span>
              <Input
                value={
                  activeUser?.createdAt
                    ? dateFormatter.format(new Date(activeUser.createdAt))
                    : "—"
                }
                {...readOnlyInputProps}
              />
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Updated</span>
              <Input
                value={
                  activeUser?.updatedAt
                    ? dateFormatter.format(new Date(activeUser.updatedAt))
                    : "—"
                }
                {...readOnlyInputProps}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editConfirmOpen} onOpenChange={setEditConfirmOpen} modal={false}>
        <DialogContent className="border border-white/10 bg-black/60 text-white backdrop-blur-md md:left-[calc(50%+8rem)]">
          <DialogHeader>
            <DialogTitle>Edit user?</DialogTitle>
            <DialogDescription>
              This will open the edit form for the selected user.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setEditConfirmOpen(false)
                setEditOpen(true)
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen} modal={false}>
        <DialogContent
          className="border border-white/10 bg-black/60 text-white backdrop-blur-md sm:max-w-2xl md:left-[calc(50%+8rem)]"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>
              Update profile details for the selected user.
            </DialogDescription>
          </DialogHeader>
          {activeUser ? (
            <div className="max-h-[70vh] overflow-y-auto pr-1">
              <UserForm
                type="edit"
                id={activeUser.id}
                onSuccess={() => setEditOpen(false)}
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen} modal={false}>
        <DialogContent className="border border-white/10 bg-black/60 text-white backdrop-blur-md md:left-[calc(50%+8rem)]">
          <DialogHeader>
          <DialogTitle>Deactivate user?</DialogTitle>
          <DialogDescription>
              This will replace personal data with a technical account.
          </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deactivating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarInset>
  )
}
