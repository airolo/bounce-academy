import { useEffect, useState } from 'react'
import { manageBooking, listAdminBookings, listTrainers } from '../services/trainingService'

const statuses = ['all', 'pending', 'confirmed', 'rejected', 'cancelled', 'completed']

function formatDate(value) {
  return new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [trainers, setTrainers] = useState([])
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')

  async function load() {
    try {
      const [nextBookings, nextTrainers] = await Promise.all([listAdminBookings(), listTrainers()])
      setBookings(nextBookings)
      setTrainers(nextTrainers)
    } catch (loadError) {
      setError(loadError.message || 'Unable to load booking requests.')
    }
  }
  // eslint-disable-next-line react/set-state-in-effect -- Async data fetch requires setState in an effect; booking list cannot be derived during render.
  useEffect(() => { load() }, [])

  async function updateBooking(bookingId, values) {
    setError('')
    try {
      await manageBooking({ bookingId, ...values })
      await load()
    } catch (updateError) {
      setError(updateError.message || 'Unable to update booking.')
    }
  }

  const visibleBookings = filter === 'all' ? bookings : bookings.filter((booking) => booking.status === filter)
  function hasConflict(booking) {
    return booking.trainer_id && bookings.some((other) => other.id !== booking.id && other.trainer_id === booking.trainer_id && new Date(booking.starts_at) < new Date(other.ends_at) && new Date(other.starts_at) < new Date(booking.ends_at))
  }
  return <section className="section admin-bookings"><div className="admin-page-header"><div><span className="eyebrow orange">Operations</span><h1>Booking requests.</h1></div><select aria-label="Filter bookings" onChange={(event) => setFilter(event.target.value)} value={filter}>{statuses.map((status) => <option key={status} value={status}>{status === 'all' ? 'All statuses' : status}</option>)}</select></div>{error && <p className="form-error">{error}</p>}<div className="admin-booking-list">{visibleBookings.map((booking) => <article className="admin-booking-card" key={booking.id}><div className="admin-booking-main"><span className="status-badge">{booking.status}</span>{hasConflict(booking) && <span className="conflict-warning">Schedule conflict — confirm only after resolving the overlap.</span>}<h2>{booking.training_services?.name}</h2><p><strong>{formatDate(booking.starts_at)}</strong> · {booking.training_services?.duration_minutes} minutes</p><p>{booking.profiles?.full_name || 'Customer'} · {booking.profiles?.phone || 'No phone provided'}</p>{booking.customer_notes && <p className="admin-note">Customer note: {booking.customer_notes}</p>}</div><div className="admin-booking-controls"><label>Trainer<select disabled={booking.status === 'completed' || booking.status === 'cancelled'} onChange={(event) => updateBooking(booking.id, { trainerId: event.target.value })} value={booking.trainer_id || ''}><option value="">Unassigned</option>{trainers.map((trainer) => <option key={trainer.id} value={trainer.id}>{trainer.name}</option>)}</select></label><label>Internal notes<textarea defaultValue={booking.admin_notes || ''} onBlur={(event) => updateBooking(booking.id, { adminNotes: event.target.value })} rows="2" /></label><div className="admin-actions">{booking.status === 'pending' && <><button className="button button-primary" onClick={() => updateBooking(booking.id, { status: 'confirmed' })} type="button">Confirm</button><button className="button button-outline" onClick={() => updateBooking(booking.id, { status: 'rejected' })} type="button">Reject</button></>}{booking.status === 'confirmed' && <><button className="button button-primary" onClick={() => updateBooking(booking.id, { status: 'completed' })} type="button">Mark completed</button><button className="button button-outline" onClick={() => updateBooking(booking.id, { status: 'cancelled' })} type="button">Cancel</button></>}{booking.status === 'pending' && <button className="text-button danger" onClick={() => updateBooking(booking.id, { status: 'cancelled' })} type="button">Cancel request</button>}</div></div></article>)}</div>{!visibleBookings.length && <p className="empty-state">No booking requests match this filter.</p>}</section>
}
