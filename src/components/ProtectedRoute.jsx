import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useEffect, useState } from 'react'

function LoadingScreen() {
  return (
    <div className="page-shell">
      <div className="card text-center text-sm text-gray-600">Loading...</div>
    </div>
  )
}

export function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />

  return children
}

export function RequireAdmin({ children }) {
  const { user, role, loading, refreshProfile } = useAuth()
  const [checkingRole, setCheckingRole] = useState(true)
  const [isAdminAllowed, setIsAdminAllowed] = useState(false)

  useEffect(() => {
    let active = true

    async function checkRole() {
      if (loading) return

      if (!user) {
        if (active) {
          setIsAdminAllowed(false)
          setCheckingRole(false)
        }
        return
      }

      try {
        const latestProfile = await refreshProfile(user.id)
        const latestRole = latestProfile?.role ?? role

        if (active) {
          setIsAdminAllowed(latestRole === 'admin')
        }
      } catch (error) {
        console.error('Role refresh failed:', error)
        if (active) {
          setIsAdminAllowed(role === 'admin')
        }
      } finally {
        if (active) setCheckingRole(false)
      }
    }

    setCheckingRole(true)
    checkRole()

    return () => {
      active = false
    }
  }, [user, role, loading, refreshProfile])

  if (loading || checkingRole) return <LoadingScreen />

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (!isAdminAllowed) {
    return <Navigate to="/" replace />
  }

  return children
}
