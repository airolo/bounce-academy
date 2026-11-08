import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { useAuth } from '../../context/AuthContextValue'

function GuardLoading() {
  return <div className="auth-loading"><LoadingSpinner /></div>
}

export function ProtectedRoute() {
  const { loading, user } = useAuth()
  const location = useLocation()
  if (loading) return <GuardLoading />
  if (!user) return <Navigate replace state={{ from: location.pathname }} to="/login" />
  return <Outlet />
}

export function AdminRoute() {
  const { loading, user, isAdmin } = useAuth()
  if (loading) return <GuardLoading />
  if (!user) return <Navigate replace to="/login" />
  if (!isAdmin) return <Navigate replace to="/account" />
  return <Outlet />
}
