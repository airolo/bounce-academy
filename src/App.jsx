import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import UserLayout from './layouts/UserLayout.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import { RequireAdmin, RequireAuth } from './components/ProtectedRoute.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'

const HomePage = lazy(() => import('./pages/HomePage.jsx'))
const ShopPage = lazy(() => import('./pages/ShopPage.jsx'))
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage.jsx'))
const CartPage = lazy(() => import('./pages/CartPage.jsx'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage.jsx'))
const WishlistPage = lazy(() => import('./pages/WishlistPage.jsx'))
const AccountPage = lazy(() => import('./pages/AccountPage.jsx'))
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'))
const AuthPage = lazy(() => import('./pages/AuthPage.jsx'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage.jsx'))
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage.jsx'))
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage.jsx'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage.jsx'))

const pageShell = (
  <div className="page-shell flex min-h-[60vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
  </div>
)

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/auth" element={<Suspense fallback={pageShell}><AuthPage /></Suspense>} />

        <Route path="/" element={<UserLayout />}>
          <Route index element={<Suspense fallback={pageShell}><HomePage /></Suspense>} />
          <Route path="shop" element={<Suspense fallback={pageShell}><ShopPage /></Suspense>} />
          <Route path="about" element={<Suspense fallback={pageShell}><AboutPage /></Suspense>} />
          <Route path="product/:id" element={<Suspense fallback={pageShell}><ProductDetailsPage /></Suspense>} />
          <Route path="cart" element={<Suspense fallback={pageShell}><CartPage /></Suspense>} />
          <Route
            path="checkout"
            element={
              <RequireAuth>
                <Suspense fallback={pageShell}><CheckoutPage /></Suspense>
              </RequireAuth>
            }
          />
          <Route
            path="wishlist"
            element={
              <RequireAuth>
                <Suspense fallback={pageShell}><WishlistPage /></Suspense>
              </RequireAuth>
            }
          />
          <Route
            path="account"
            element={
              <RequireAuth>
                <Suspense fallback={pageShell}><AccountPage /></Suspense>
              </RequireAuth>
            }
          />
        </Route>

        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route path="dashboard" element={<Suspense fallback={pageShell}><AdminDashboardPage /></Suspense>} />
          <Route path="products" element={<Suspense fallback={pageShell}><AdminProductsPage /></Suspense>} />
          <Route path="orders" element={<Suspense fallback={pageShell}><AdminOrdersPage /></Suspense>} />
          <Route path="users" element={<Suspense fallback={pageShell}><AdminUsersPage /></Suspense>} />
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
