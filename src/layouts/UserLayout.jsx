import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'

export default function UserLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
