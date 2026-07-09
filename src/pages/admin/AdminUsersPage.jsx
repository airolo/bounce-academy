import { useEffect, useState } from 'react'
import { getUsers, updateUserRole } from '../../lib/db.js'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])

  async function loadUsers() {
    const rows = await getUsers()
    setUsers(rows)
  }

  useEffect(() => {
    loadUsers().catch(console.error)
  }, [])

  async function handleRoleChange(id, role) {
    await updateUserRole(id, role)
    loadUsers().catch(console.error)
  }

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold tracking-tight">Users</h1>

      <div className="card overflow-x-auto p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-100">
                <td className="px-4 py-3 font-medium">{user.full_name ?? '-'}</td>
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
    </div>
  )
}
