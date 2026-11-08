import { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle2, Clock3 } from 'lucide-react'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContextValue'
import { listCustomerBookings, listTrainingServices, requestBooking, updateCustomerProfile } from '../services/trainingService'

const initialForm = { serviceId: '', date: '', time: '', fullName: '', phone: '', notes: '' }

function formatBookingDate(value) {
  return new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function TrainingPage() {
  const { user, profile } = useAuth()
  const [services, setServices] = useState([])
  const [bookings, setBookings] = useState([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([listTrainingServices(), user ? listCustomerBookings(user.id) : Promise.resolve([])])
      .then(([nextServices, nextBookings]) => {
        setServices(nextServices)
        setBookings(nextBookings)
        setForm((current) => ({ ...current, fullName: profile?.full_name || '', phone: profile?.phone || '', serviceId: current.serviceId || nextServices[0]?.id || '' }))
      })
      .catch(() => setError('We could not load training programs. Please try again.'))
      .finally(() => setLoading(false))
  }, [profile, user])

  const selectedService = services.find((service) => service.id === form.serviceId)
  const [today] = useState(() => new Date().toISOString().slice(0, 10))

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setError('')
    setSuccess(false)
  }

  async function submitBooking(event) {
    event.preventDefault()
    if (!user) return
    const startsAt = new Date(`${form.date}T${form.time}`)
    if (!form.date || !form.time || Number.isNaN(startsAt.getTime()) || startsAt < new Date()) {
      setError('Choose a future date and start time.')
      return
    }
    if (!selectedService || !form.fullName.trim() || !form.phone.trim()) {
      setError('Complete the required fields before submitting.')
      return
    }
    setSubmitting(true)
    try {
      await updateCustomerProfile({ userId: user.id, fullName: form.fullName, phone: form.phone })
      await requestBooking({ serviceId: form.serviceId, startsAt: startsAt.toISOString(), customerNotes: form.notes })
      setSuccess(true)
      setForm((current) => ({ ...initialForm, fullName: current.fullName, phone: current.phone, serviceId: services[0]?.id || '' }))
      setBookings(await listCustomerBookings(user.id))
    } catch (bookingError) {
      setError(bookingError.message || 'We could not submit your booking request.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="training-page">
      <section className="training-hero">
        <div><span className="eyebrow orange">Bounce Academy Training</span><h1>Build the game<br />you want to play.</h1><p>Focused coaching, honest feedback, and a plan that meets you where you are.</p><a className="button button-primary" href="#book">Book a session <ArrowRight size={15} /></a></div>
      </section>
      <section className="section training-programs">
        <div className="section-heading"><div><span className="eyebrow orange">The programs</span><h2>Training with<br />purpose.</h2></div><p className="section-lead">Choose a focus, show up consistently, and let the work compound.</p></div>
        {loading ? <div className="shop-state page-state"><LoadingSpinner /><p>Loading programs...</p></div> : error && !services.length ? <p className="form-error">{error}</p> : <div className="training-card-grid">{services.map((service) => <article className={`training-card ${form.serviceId === service.id ? 'selected' : ''}`} key={service.id} onClick={() => setForm((current) => ({ ...current, serviceId: service.id }))}><div className="training-card-number">0{services.indexOf(service) + 1}</div><h3>{service.name}</h3><p>{service.description || 'A focused session designed to move your game forward.'}</p><span><Clock3 size={14} /> {service.duration_minutes} minutes</span><strong>₱{Number(service.price).toLocaleString('en-PH')}</strong></article>)}</div>}
      </section>
      <section className="training-booking-section" id="book">
        <div className="section training-booking-layout">
          <div className="training-booking-copy"><span className="eyebrow orange">Reserve your spot</span><h2>Make the next<br />rep count.</h2><p>Requests are reviewed by our team before they are confirmed. We’ll use your contact details to follow up on availability.</p></div>
          <div className="booking-panel">
            {!user ? <div className="booking-login"><h3>Sign in to book training.</h3><p>Your booking history and requests are tied to your Bounce Academy account.</p><Link className="button button-primary" to="/login">Sign in to continue</Link></div> : <form className="booking-form" onSubmit={submitBooking}>
              {success && <div className="booking-success"><CheckCircle2 size={20} /><span>Request received. We’ll be in touch once your session is reviewed.</span></div>}
              <label>Training service<select name="serviceId" onChange={updateField} required value={form.serviceId}>{services.map((service) => <option key={service.id} value={service.id}>{service.name} · {service.duration_minutes} min</option>)}</select></label>
              <div className="form-columns"><label>Preferred date<input min={today} name="date" onChange={updateField} required type="date" value={form.date} /></label><label>Start time<input name="time" onChange={updateField} required type="time" value={form.time} /></label></div>
              <div className="form-columns"><label>Full name<input name="fullName" onChange={updateField} required value={form.fullName} /></label><label>Phone number<input name="phone" onChange={updateField} required type="tel" value={form.phone} /></label></div>
              <label>Notes <textarea name="notes" onChange={updateField} placeholder="Anything your coach should know?" rows="3" value={form.notes} /></label>
              {error && <p className="form-error">{error}</p>}
              <button className="button button-primary" disabled={submitting} type="submit">{submitting ? 'Sending request...' : 'Submit booking request'}</button>
            </form>}
          </div>
        </div>
      </section>
      {user && <section className="section booking-history"><div className="section-heading"><div><span className="eyebrow orange">Your sessions</span><h2>Booking history.</h2></div></div>{bookings.length ? <div className="history-list">{bookings.map((booking) => <div className="history-item" key={booking.id}><div><strong>{booking.training_services?.name}</strong><p>{formatBookingDate(booking.starts_at)} · {booking.training_services?.duration_minutes} minutes</p></div><div className="history-meta"><span className="status-badge">{booking.status}</span><small>{booking.trainers?.name || 'Trainer to be assigned'}</small></div></div>)}</div> : <p className="empty-state">No booking requests yet.</p>}</section>}
    </div>
  )
}
