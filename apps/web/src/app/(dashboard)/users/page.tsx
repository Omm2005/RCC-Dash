import UsersTable from "./users-table"
import { getAllUsers, getUserRole } from "@/lib/actions"

export default async function UsersPage() {
  const users = await getAllUsers()
  const role = await getUserRole();
  const isAdmin = role === "admin";
  if (!isAdmin) {
    return null;
  }

  return (
    <main className="flex w-full flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-10 xl:px-12">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold sm:text-3xl">Users</h1>
          <span className="text-sm text-muted-foreground">
            {users.length} total
          </span>
        </div>
        <UsersTable data={users} />
      </div>
    </main>
  )
}
