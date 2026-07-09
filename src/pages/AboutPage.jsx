import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi'
import { FiFacebook, FiInstagram, FiMail, FiPhone } from 'react-icons/fi'
import SectionHeading from '../components/ui/SectionHeading.jsx'

const storyHighlights = [
  {
    title: 'How It Started',
    body: 'Bounce Academy began as a small local basketball initiative led by your cousin, focused on helping committed players train with purpose.',
  },
  {
    title: 'Owner And Vision',
    body: 'Your cousin built Bounce Academy to blend mentorship, discipline, and culture. The store supports the program while the camp develops real game-ready skills.',
  },
  {
    title: 'Beyond Products',
    body: 'Bounce Academy is not only selling products. It also runs a dedicated training camp for players who want to improve fundamentals, IQ, and confidence on the court.',
  },
]

const trainingGallery = [
  { src: '/gallery/ballhandling.jpg', title: 'Training Camp Session', subtitle: 'Ball handling and footwork drills' },
  { src: '/gallery/shootingreps.jpg', title: 'Player Mentorship', subtitle: 'One-on-one coaching and guidance' },
  { src: '/gallery/pastevents.jpg', title: 'Camp Graduation', subtitle: 'Celebrating player progress and growth' },
  { src: '/gallery/skills.jpg', title: 'Skills Clinic', subtitle: 'Defense, reads, and decision making' },
  { src: '/gallery/conditioning.jpg', title: 'Conditioning Session', subtitle: 'Physical preparation and endurance training' },
  { src: '/gallery/bbprogram.jpg', title: 'NCF Tigers Basketball Program', subtitle: 'Building chemistry and competitive play' },
  
]

export default function AboutPage() {
  const aboutImages = [
    trainingGallery[0]?.src,
    trainingGallery[1]?.src,
    trainingGallery[2]?.src,
    trainingGallery[4]?.src,
  ].filter(Boolean)

  const galleryPageSize = 5
  const [galleryPage, setGalleryPage] = useState(0)
  const [selectedImage, setSelectedImage] = useState(null)
  const [aboutImageIndex, setAboutImageIndex] = useState(0)
  const touchStartX = useRef(null)
  const aboutTouchStartX = useRef(null)

  const galleryPageCount = Math.ceil(trainingGallery.length / galleryPageSize)
  const canPaginateGallery = galleryPageCount > 1

  const visibleGalleryItems = useMemo(() => {
    const start = galleryPage * galleryPageSize
    return trainingGallery.slice(start, start + galleryPageSize)
  }, [galleryPage])

  const goToPreviousGalleryPage = () => {
    setGalleryPage((prev) => (prev === 0 ? galleryPageCount - 1 : prev - 1))
  }

  const goToNextGalleryPage = () => {
    setGalleryPage((prev) => (prev === galleryPageCount - 1 ? 0 : prev + 1))
  }

  const goToPreviousAboutImage = () => {
    setAboutImageIndex((prev) => (prev === 0 ? aboutImages.length - 1 : prev - 1))
  }

  const goToNextAboutImage = () => {
    setAboutImageIndex((prev) => (prev === aboutImages.length - 1 ? 0 : prev + 1))
  }

  const handleGalleryTouchStart = (event) => {
    touchStartX.current = event.touches[0]?.clientX ?? null
  }

  const handleGalleryTouchEnd = (event) => {
    if (!canPaginateGallery || touchStartX.current === null) return

    const endX = event.changedTouches[0]?.clientX
    if (typeof endX !== 'number') return

    const swipeDistance = touchStartX.current - endX
    const swipeThreshold = 50

    if (Math.abs(swipeDistance) < swipeThreshold) return

    if (swipeDistance > 0) {
      goToNextGalleryPage()
      return
    }

    goToPreviousGalleryPage()
  }

  const handleAboutTouchStart = (event) => {
    aboutTouchStartX.current = event.touches[0]?.clientX ?? null
  }

  const handleAboutTouchEnd = (event) => {
    if (aboutImages.length <= 1 || aboutTouchStartX.current === null) return

    const endX = event.changedTouches[0]?.clientX
    if (typeof endX !== 'number') return

    const swipeDistance = aboutTouchStartX.current - endX
    const swipeThreshold = 50

    if (Math.abs(swipeDistance) < swipeThreshold) return

    if (swipeDistance > 0) {
      goToNextAboutImage()
      return
    }

    goToPreviousAboutImage()
  }

  useEffect(() => {
    if (!selectedImage) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedImage(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedImage])



  return (
    <div className="page-shell space-y-8">
      <section className="card overflow-hidden p-0">
        <div className="grid md:grid-cols-2">
          <div className="p-8 sm:p-10">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">About Bounce Academy</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Built from family passion, shaped by player development.
            </h1>
            <p className="mt-4 max-w-lg text-sm text-gray-600">
              Bounce Academy started through your cousin's commitment to helping serious players level up
              through structured training, coaching, and community support. Over time, the brand grew into
              both a basketball training camp and a product line that represents the same discipline and mindset.
            </p>
          </div>
          <div
            className="relative min-h-64 overflow-hidden bg-gray-100"
            onTouchStart={handleAboutTouchStart}
            onTouchEnd={handleAboutTouchEnd}
          >
            <img
              src={aboutImages[aboutImageIndex]}
              alt="Bounce Academy training"
              loading="eager"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

            {aboutImages.length > 1 ? (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-4">
                <button
                  type="button"
                  aria-label="Previous image"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/40 text-white transition hover:bg-black/60"
                  onClick={goToPreviousAboutImage}
                >
                  <FiChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/40 text-white transition hover:bg-black/60"
                  onClick={goToNextAboutImage}
                >
                  <FiChevronRight size={20} />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {storyHighlights.map((item) => (
          <article key={item.title} className="card">
            <h2 className="text-lg font-semibold tracking-tight">{item.title}</h2>
            <p className="mt-2 text-sm text-gray-600">{item.body}</p>
          </article>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHeading
            title="Training And Events Gallery"
            subtitle="Photos from Bounce Academy training sessions, clinics, and past basketball events."
          />

          {canPaginateGallery ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous gallery images"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-gray-700 transition hover:border-gray-400 hover:text-black"
                onClick={goToPreviousGalleryPage}
              >
                <FiChevronLeft size={18} />
              </button>
              <p className="min-w-20 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                {galleryPage + 1} / {galleryPageCount}
              </p>
              <button
                type="button"
                aria-label="Next gallery images"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-gray-700 transition hover:border-gray-400 hover:text-black"
                onClick={goToNextGalleryPage}
              >
                <FiChevronRight size={18} />
              </button>
            </div>
          ) : null}
        </div>

        <div
          className="grid auto-rows-[180px] grid-cols-2 gap-4 md:grid-cols-4"
          onTouchStart={handleGalleryTouchStart}
          onTouchEnd={handleGalleryTouchEnd}
        >
          {visibleGalleryItems.map((item, index) => (
            <figure
              key={item.src}
              className={`group relative overflow-hidden rounded-2xl border border-gray-200 ${
                index % 5 === 0 ? 'col-span-2 row-span-2' : ''
              }`}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedImage(item)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setSelectedImage(item)
                }
              }}
            >
              <img
                src={item.src}
                alt={item.title}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-3 text-white">
                <p className="text-sm font-semibold leading-tight">{item.title}</p>
                <p className="mt-1 text-xs text-white/80">{item.subtitle}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="text-2xl font-semibold tracking-tight">Owner Spotlight</h2>
        <p className="mt-3 text-sm leading-7 text-gray-600">
          Bounce Academy is owner-led by your cousin, whose vision is to build a stronger basketball culture
          through consistent training, positive mentorship, and opportunities for players to compete and grow.
          Every camp cycle is designed to help athletes sharpen technique and bring those improvements into real games.
        </p>
      </section>

      {selectedImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Full image view"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            aria-label="Close image viewer"
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/40 text-white transition hover:bg-black/60"
            onClick={() => setSelectedImage(null)}
          >
            <FiX size={20} />
          </button>

          <div
            className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-white/20 bg-black"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={selectedImage.src}
              alt={selectedImage.title}
              className="max-h-[78vh] w-full object-contain"
            />
            <div className="border-t border-white/15 px-4 py-3 text-white">
              <p className="text-base font-semibold leading-tight">{selectedImage.title}</p>
              <p className="mt-1 text-sm text-white/75">{selectedImage.subtitle}</p>
            </div>
          </div>
        </div>
      ) : null}

      <footer className="overflow-hidden rounded-3xl border border-black bg-black px-6 py-10 text-white sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/60">Bounce Academy</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Movement-ready essentials for every day.
            </h2>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Explore</h3>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/80">
              <Link to="/shop" className="transition hover:text-white">
                Shop all products
              </Link>
              <Link to="/wishlist" className="transition hover:text-white">
                Saved items
              </Link>
              <Link to="/cart" className="transition hover:text-white">
                Cart
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Account</h3>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/80">
              <Link to="/auth" className="transition hover:text-white">
                Sign in
              </Link>
              <Link to="/account" className="transition hover:text-white">
                My account
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Connect</h3>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/80">
              <a href="mailto:info@bounceacademy.com" className="inline-flex items-center gap-2 transition hover:text-white">
                <FiMail size={16} />
                info@bounceacademy.com
              </a>
              <a href="tel:+1234567890" className="inline-flex items-center gap-2 transition hover:text-white">
                <FiPhone size={16} />
                0927 437 2354
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-white/50">© {new Date().getFullYear()} Bounce Academy. All rights reserved.</p>
            </div>
            <div className="flex gap-4 sm:gap-5">
              <a
                href="https://www.facebook.com/bounceacademynaga"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-white/60 transition hover:border-white hover:bg-white/10 hover:text-white"
              >
                <FiFacebook size={18} />
              </a>
              <a
                href="https://www.instagram.com/bounce_academyph"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-white/60 transition hover:border-white hover:bg-white/10 hover:text-white"
              >
                <FiInstagram size={18} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
