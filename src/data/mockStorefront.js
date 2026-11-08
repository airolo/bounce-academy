export const categories = [
  { name: 'Apparel', description: 'Made for the daily grind', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Footwear', description: 'Find your next step', image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80' },
  { name: 'Equipment', description: 'Dial in your setup', image: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=800&q=80' },
  { name: 'Accessories', description: 'The finishing touch', image: 'https://images.unsplash.com/photo-1580089982815-4e8e7c1d9e7a?auto=format&fit=crop&w=800&q=80' },
]

export const products = [
  { name: 'Everyday Varsity Tee', category: 'Apparel', price: 1890, availability: 'In stock', badge: 'New arrival', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80' },
  { name: 'Court Vision Low', category: 'Footwear', price: 5490, availability: 'In stock', badge: 'Best seller', image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80' },
  { name: 'Core Training Shorts', category: 'Apparel', price: 2290, availability: 'In stock', image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80' },
  { name: 'Bounce Pro Ball', category: 'Equipment', price: 2490, availability: 'Low stock', badge: 'Best seller', image: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=800&q=80' },
]

export const formatPrice = (price) => new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 2,
}).format(price)
