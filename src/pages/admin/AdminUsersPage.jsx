import { useEffect, useState } from 'react'
import { getUsers, updateUserRole } from '../../lib/db.js'
import { FiAlertTriangle, FiX } from 'react-icons/fi'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [pendingChange, setPendingChange] = useState(null)

  async function loadUsers() {
    setIsLoading(true)
    try {
      const rows = await getUsers()
      setUsers(rows)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers().catch(console.error)
  }, [])

  function handleRoleChange(id, role) {
    const target = users.find((u) => u.id === id)
    setPendingChange({ id, role, name: target?.full_name ?? target?.email ?? 'this user' })
  }

  async function handleConfirmRoleChange() {
    if (!pendingChange) return
    try {
      await updateUserRole(pendingChange.id, pendingChange.role)
      setPendingChange(null)
      await loadUsers()
    } catch (error) {
      console.error(error)
      alert(error.message)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-gray-600">Manage roles and keep the account list easy to scan.</p>
        </div>
        <p className="text-sm text-gray-500">{users.length} total users</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`user-skeleton-${index}`} className="card space-y-3">
              <div className="h-4 w-32 rounded-full bg-gray-200" />
              <div className="h-3 w-20 rounded-full bg-gray-200" />
              <div className="h-10 w-full rounded-xl bg-gray-200" />
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="card border-dashed border-gray-300 bg-gray-50 text-sm text-gray-600">
          <p className="font-medium text-black">No users found.</p>
          <p className="mt-1">Once customers register, their profiles will appear here for role management.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:hidden">
            {users.map((user) => (
              <article key={user.id} className="card space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">User</p>
                    <h2 className="mt-1 text-lg font-semibold">{user.full_name ?? 'Unnamed user'}</h2>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      user.role === 'admin' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>

                <p className="text-sm text-gray-600">{user.email ?? 'No email on file'}</p>

                <label className="block text-sm">
                  <span className="mb-1 block text-gray-700">Role</span>
                  <select
                    value={user.role}
                    onChange={(event) => handleRoleChange(user.id, event.target.value)}
                    className="input w-full"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </label>
              </article>
            ))}
          </div>

          <div className="card hidden overflow-x-auto p-0 md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 align-top">
                    <td className="px-4 py-3 font-medium">{user.full_name ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{user.email ?? '-'}</td>
                    <td className="px-4 py-3 capitalize">{user.role}</td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(event) => handleRoleChange(user.id, event.target.value)}
                        className="input max-w-40"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {pendingChange ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setPendingChange(null)}
        >
          <div
            className="card max-w-md p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <FiAlertTriangle className="h-6 w-6 text-amber-500" />
                <h2 className="text-lg font-semibold">Confirm Role Change</h2>
              </div>
              <button
                type="button"
                aria-label="Cancel"
                onClick={() => setPendingChange(null)}
                className="text-gray-500 transition hover:text-black"
              >
                <FiX size={20} />
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Change <strong>{pendingChange.name}</strong> to <strong>{pendingChange.role}</strong>?
              This will immediately update their permissions.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingChange(null)}
                className="button-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRoleChange}
                className="button-primary"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
