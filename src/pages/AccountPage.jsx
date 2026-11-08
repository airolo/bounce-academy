import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductSkeleton } from '../components/common/ProductSkeleton'
import { FormAlert, FormField } from '../components/auth/AuthLayout'
import { addressSchema, profileSchema } from '../schemas/auth'
import { useAuth } from '../context/AuthContextValue'
import { supabase } from '../lib/supabase'

const emptyAddress = { label: 'Home', recipientName: '', phone: '', line1: '', line2: '', city: '', province: '', region: '', postalCode: '' }

function formatDate(value) {
  return new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' }).format(new Date(value))
}

export function AccountPage() {
  const { user, profile, refreshProfile, signOut } = useAuth()
  const [addresses, setAddresses] = useState([])
  const [orders, setOrders] = useState([])
  const [bookings, setBookings] = useState([])
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState('')
  const [addressError, setAddressError] = useState('')
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [accountLoading, setAccountLoading] = useState(true)

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: profile?.full_name || '', phone: profile?.phone || '' },
  })
  const addressForm = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: emptyAddress,
  })

  const loadAccountData = useCallback(async () => {
    setLoadError('')
    setAccountLoading(true)
    const [addressResult, orderResult, bookingResult] = await Promise.all([
      supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('orders').select('id, status, total, created_at, order_items(product_name, variant_name, quantity)').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('bookings').select('id, starts_at, ends_at, status, training_services(name), trainers(name)').eq('user_id', user.id).order('starts_at', { ascending: false }),
    ])
    const failed = [addressResult, orderResult, bookingResult].find((result) => result.error)
    if (failed) setLoadError(failed.error.message)
    else {
      setAddresses(addressResult.data || [])
      setOrders(orderResult.data || [])
      setBookings(bookingResult.data || [])
    }
    setAccountLoading(false)
  }, [user.id])

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect -- Async data fetch requires setState in an effect; account data cannot be derived during render.
    loadAccountData()
  }, [loadAccountData])

  async function updateProfile(values) {
    setNotice('')
    const { error } = await supabase.from('profiles').update({ full_name: values.fullName, phone: values.phone || null }).eq('id', user.id)
    if (error) profileForm.setError('root', { message: error.message })
    else {
      await refreshProfile()
      setNotice('Profile updated.')
    }
  }

  async function addAddress(values) {
    setAddressError('')
    const { error } = await supabase.from('addresses').insert({
      user_id: user.id,
      label: values.label,
      recipient_name: values.recipientName,
      phone: values.phone,
      line1: values.line1,
      line2: values.line2 || null,
      city: values.city,
      province: values.province,
      region: values.region,
      postal_code: values.postalCode,
    })
    if (error) setAddressError(error.message)
    else {
      addressForm.reset(emptyAddress)
      setShowAddressForm(false)
      await loadAccountData()
      setNotice('Address added.')
    }
  }

  async function setDefaultAddress(id) {
    setAddressError('')
    const clearResult = await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id)
    if (clearResult.error) {
      setAddressError(clearResult.error.message)
      return
    }
    const result = await supabase.from('addresses').update({ is_default: true }).eq('id', id).eq('user_id', user.id)
    if (result.error) setAddressError(result.error.message)
    else {
      await loadAccountData()
      setNotice('Default address updated.')
    }
  }

  async function deleteAddress(id) {
    if (!window.confirm('Are you sure you want to delete this address?')) return
    const { error } = await supabase.from('addresses').delete().eq('id', id).eq('user_id', user.id)
    if (error) setAddressError(error.message)
    else await loadAccountData()
  }

  return (
    <div className="account-page">
      <div className="account-header">
        <div><span className="eyebrow orange">Your account</span><h1>Keep your game moving.</h1><p>{user.email}</p></div>
        <button className="button button-outline" onClick={signOut} type="button">Sign out</button>
      </div>
      {accountLoading && <div className="shop-state page-state"><div className="product-grid shop-grid">{Array.from({ length: 4 }, (_, index) => <ProductSkeleton key={index} />)}</div></div>}
      {!accountLoading && loadError && <FormAlert>{loadError}</FormAlert>}
      {!accountLoading && notice && <div className="form-success account-notice">{notice}</div>}
      <div className="account-grid">
        <section className="account-card">
          <div className="card-heading"><h2>Profile</h2></div>
          <form className="account-form" onSubmit={profileForm.handleSubmit(updateProfile)}>
            {profileForm.formState.errors.root && <FormAlert>{profileForm.formState.errors.root.message}</FormAlert>}
            <FormField label="Full name" {...profileForm.register('fullName')} error={profileForm.formState.errors.fullName?.message} />
            <FormField label="Phone number" type="tel" {...profileForm.register('phone')} error={profileForm.formState.errors.phone?.message} />
            <button className="button button-primary" disabled={profileForm.formState.isSubmitting} type="submit">Save profile</button>
          </form>
        </section>
        <section className="account-card account-card-wide">
          <div className="card-heading"><h2>Delivery addresses</h2><button className="text-button" onClick={() => setShowAddressForm(!showAddressForm)} type="button">{showAddressForm ? 'Cancel' : '+ Add address'}</button></div>
          {addressError && <FormAlert>{addressError}</FormAlert>}
          {showAddressForm && <form className="address-form" onSubmit={addressForm.handleSubmit(addAddress)}>
            <div className="form-columns"><FormField label="Label" {...addressForm.register('label')} error={addressForm.formState.errors.label?.message} /><FormField label="Recipient name" {...addressForm.register('recipientName')} error={addressForm.formState.errors.recipientName?.message} /></div>
            <FormField label="Phone" type="tel" {...addressForm.register('phone')} error={addressForm.formState.errors.phone?.message} />
            <FormField label="Address line" {...addressForm.register('line1')} error={addressForm.formState.errors.line1?.message} />
            <FormField label="Apartment, unit, etc. (optional)" {...addressForm.register('line2')} error={addressForm.formState.errors.line2?.message} />
            <div className="form-columns"><FormField label="City" {...addressForm.register('city')} error={addressForm.formState.errors.city?.message} /><FormField label="Province" {...addressForm.register('province')} error={addressForm.formState.errors.province?.message} /><FormField label="Region" {...addressForm.register('region')} error={addressForm.formState.errors.region?.message} /><FormField label="Postal code" {...addressForm.register('postalCode')} error={addressForm.formState.errors.postalCode?.message} /></div>
            <button className="button button-primary" disabled={addressForm.formState.isSubmitting} type="submit">Save address</button>
          </form>}
          <div className="address-list">{addresses.length === 0 && !showAddressForm && <p className="empty-state">No saved addresses yet.</p>}{addresses.map((address) => <div className="address-item" key={address.id}><div><strong>{address.label} {address.is_default && <span className="default-badge">Default</span>}</strong><p>{address.recipient_name}<br />{address.line1}{address.line2 && `, ${address.line2}`}<br />{address.city}, {address.province} {address.postal_code}</p></div><div className="address-actions">{!address.is_default && <button className="text-button" onClick={() => setDefaultAddress(address.id)} type="button">Set default</button>}<button className="text-button danger" onClick={() => deleteAddress(address.id)} type="button">Remove</button></div></div>)}</div>
        </section>
        <section className="account-card">
          <div className="card-heading"><h2>Order history</h2><Link className="text-button" to="/shop">Shop now</Link></div>
          {orders.length === 0 ? <p className="empty-state">Your orders will appear here.</p> : <div className="history-list">{orders.map((order) => <div className="history-item" key={order.id}><div><strong>Order #{order.id.slice(0, 8).toUpperCase()}</strong><p>{formatDate(order.created_at)} · {order.order_items?.length || 0} item(s)</p></div><div className="history-meta"><span className="status-badge">{order.status}</span><strong>₱{Number(order.total).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong></div></div>)}</div>}
        </section>
        <section className="account-card">
          <div className="card-heading"><h2>Training bookings</h2><Link className="text-button" to="/training">Book training</Link></div>
          {bookings.length === 0 ? <p className="empty-state">Your training bookings will appear here.</p> : <div className="history-list">{bookings.map((booking) => <div className="history-item" key={booking.id}><div><strong>{booking.training_services?.name || 'Training session'}</strong><p>{formatDate(booking.starts_at)} · {booking.trainers?.name || 'Bounce Academy'}</p></div><span className="status-badge">{booking.status}</span></div>)}</div>}
        </section>
      </div>
    </div>
  )
}
