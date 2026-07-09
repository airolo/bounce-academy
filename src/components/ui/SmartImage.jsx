import { useEffect, useState } from 'react'
import heroFallback from '../../assets/hero.png'

export default function SmartImage({ src, alt, className = '', loading = 'lazy', decoding = 'async' }) {
  const [imageSrc, setImageSrc] = useState(src || heroFallback)

  useEffect(() => {
    setImageSrc(src || heroFallback)
  }, [src])

  return (
    <img
      src={imageSrc}
      alt={alt}
      loading={loading}
      decoding={decoding}
      className={className}
      onError={() => {
        if (imageSrc !== heroFallback) {
          setImageSrc(heroFallback)
        }
      }}
    />
  )
}
