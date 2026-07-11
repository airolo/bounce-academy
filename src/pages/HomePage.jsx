import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiFacebook, FiInstagram, FiMail, FiPhone, FiShield, FiStar, FiTruck } from 'react-icons/fi'
import SectionHeading from '../components/ui/SectionHeading.jsx'
import SmartImage from '../components/ui/SmartImage.jsx'
import { getProducts } from '../lib/db.js'
import { formatCurrency } from '../utils/format.js'
import heroFallback from '../assets/hero.png'

const categoryTiles = [
  {
    key: 'Short',
    label: 'Shorts',
    eyebrow: 'Built for the court',
  },
  {
    key: 'Shirt',
    label: 'Shirts',
    eyebrow: 'From practice to street',
  },
  {
    key: 'Hoodie',
    label: 'Hoodies',
    eyebrow: ' Layer up in style',
  },
]

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true)
  const [heroImages, setHeroImages] = useState([heroFallback])
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0)

  useEffect(() => {
    async function loadFeaturedProducts() {
      try {
        const rows = await getProducts()
        setAllProducts(rows)
        setFeaturedProducts(rows.filter((product) => product.is_featured))

        const rotatingImages = rows
          .filter((product) => product.is_featured)
          .map((product) => product.image_url)
          .filter(Boolean)
          .slice(0, 6)

        setHeroImages(rotatingImages.length > 0 ? rotatingImages : [heroFallback])
      } catch (error) {
        console.error('Failed to load featured products', error)
      } finally {
        setIsFeaturedLoading(false)
      }
    }

    loadFeaturedProducts()
  }, [])

  useEffect(() => {
    setCurrentHeroIndex(0)
  }, [heroImages])

  useEffect(() => {
    if (heroImages.length <= 1) return

    const timerId = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length)
    }, 5000)

    return () => clearInterval(timerId)
  }, [heroImages])

  const categoryCards = categoryTiles.map((tile) => {
    const productsForCategory = allProducts.filter((product) => product.category === tile.key)
    const featuredMatch = productsForCategory.find((product) => product.is_featured)
    const product = featuredMatch ?? productsForCategory[0] ?? null

    return {
      ...tile,
      count: productsForCategory.length,
      imageUrl: product?.image_url || heroFallback,
    }
  })

  return (
    <div className="page-shell space-y-8">
      <section className="overflow-hidden rounded-3xl border border-gray-200 bg-black text-white shadow-soft">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative overflow-hidden p-8 sm:p-10 lg:p-12">
            <div className="absolute inset-0 opacity-40">
              <div className="absolute left-[-5rem] top-[-4rem] h-48 w-48 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute bottom-[-4rem] right-[-2rem] h-56 w-56 rounded-full bg-white/5 blur-3xl" />
            </div>
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">Bounce Academy</p>
              <h1 className="mt-3 max-w-lg text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Simple gear. Clean choices. Ready for every game.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/75">
                Sporty essentials for every day. Bounce Academy is a local brand that makes movement-ready gear for the active lifestyle. Shop our curated collection of apparel, accessories, and footwear.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/shop" className="inline-flex items-center justify-center rounded-xl border border-white bg-white px-4 py-2 text-sm font-medium text-black transition hover:translate-y-[-1px]">
                  Shop Now
                </Link>
                <Link to="/about" className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-white/40">
                  About Bounce
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <FiTruck className="h-5 w-5 text-white/80" />
                  <p className="mt-3 text-sm font-semibold">Fast delivery</p>
                  <p className="mt-1 text-xs leading-5 text-white/65">Clear shipping timelines before checkout.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <FiShield className="h-5 w-5 text-white/80" />
                  <p className="mt-3 text-sm font-semibold">Trusted support</p>
                  <p className="mt-1 text-xs leading-5 text-white/65">Easy access to owner contact and help.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <FiStar className="h-5 w-5 text-white/80" />
                  <p className="mt-3 text-sm font-semibold">Featured picks</p>
                  <p className="mt-1 text-xs leading-5 text-white/65">Highlighted items surface first on the storefront.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative min-h-[22rem] overflow-hidden bg-gray-100 lg:min-h-full">
            {heroImages.map((image, index) => (
              <SmartImage
                key={`${image}-${index}`}
                src={image}
                alt="Bounce Academy collection"
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
                  index === currentHeroIndex ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
                }`}
                loading={index === currentHeroIndex ? 'eager' : 'lazy'}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      <section className="space-y-4 reveal-up">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-gray-500"></p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-black sm:text-3xl">Shop by Category</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-600">
              Start with the core pieces and jump into the category that fits your style.
            </p>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:text-gray-600"
          >
            View all
            <FiArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {categoryCards.map((category, index) => (
            <Link
              key={category.key}
              to={`/shop?category=${encodeURIComponent(category.key)}`}
              className="group relative min-h-[23rem] overflow-hidden rounded-3xl border border-gray-200 bg-black shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <SmartImage
                src={category.imageUrl}
                alt={category.label}
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 sm:p-7">
                <div className="max-w-[75%]">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/60">{category.eyebrow}</p>
                  <h3 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{category.label}</h3>
                  <p className="mt-3 text-sm text-white/70">{category.count} style{category.count === 1 ? '' : 's'}</p>
                </div>

                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition group-hover:border-white/40 group-hover:bg-white/20">
                  <FiArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4 reveal-up">
        <SectionHeading title="Featured Products" subtitle="A few standout picks from the current collection." />

        {isFeaturedLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <article
                key={`featured-skeleton-${index}`}
                className="card flex h-full flex-col overflow-hidden p-0 reveal-up"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="h-56 w-full skeleton-shimmer" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-20 rounded-full bg-gray-200" />
                  <div className="h-5 w-3/4 rounded-full bg-gray-200" />
                  <div className="h-4 w-1/2 rounded-full bg-gray-200" />
                  <div className="h-6 w-1/3 rounded-full bg-gray-200" />
                  <div className="h-10 w-full rounded-xl bg-gray-200" />
                </div>
              </article>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 content-fade-in">
            {featuredProducts.map((product, index) => (
              <article
                key={product.id}
                className="group card flex h-full flex-col overflow-hidden p-0 reveal-up"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="relative overflow-hidden rounded-t-2xl border-b border-gray-200 bg-gray-100">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-56 w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col gap-2 p-5">
                  <p className="text-xs uppercase tracking-wide text-gray-500">{product.category}</p>
                  <h3 className="text-lg font-semibold leading-tight text-black">{product.name}</h3>
                  <p className="text-sm text-gray-600">In stock: {product.stock}</p>
                  <p className="mt-auto text-lg font-semibold">{formatCurrency(product.price)}</p>
                  <Link to={`/product/${product.id}`} className="button-secondary mt-3 justify-center">
                    View Product
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="card text-sm text-gray-600 content-fade-in">
            No featured products selected yet. Admin can mark products as featured from the Products page.
          </div>
        )}
      </section>

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
