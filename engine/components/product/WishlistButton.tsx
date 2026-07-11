"use client"

import { Heart } from "lucide-react"
import { useState } from "react"
import { toggleWishlist } from "@/engine/api/wishlist"
import { usePathname } from "next/navigation"

export function WishlistButton({
  productId,
  initialWishlisted,
  variant = "card",
}: {
  productId: string
  initialWishlisted: boolean
  variant?: "card" | "detail"
}) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted)
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return

    setLoading(true)
    setWishlisted((prev) => !prev)

    try {
      const result = await toggleWishlist(productId, pathname)
      if (result?.error) {
        setWishlisted((prev) => !prev)
      }
    } catch {
      setWishlisted((prev) => !prev)
    } finally {
      setLoading(false)
    }
  }

  if (variant === "detail") {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className="p-2 border border-[#E0E0E0] hover:border-[#0A0A0A] transition-colors"
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          className={`h-5 w-5 transition-colors ${
            wishlisted
              ? "fill-[#0A0A0A] text-[#0A0A0A]"
              : "text-[#8C8C8C]"
          }`}
        />
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="transition-opacity"
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={`h-4 w-4 drop-shadow-sm transition-colors ${
          wishlisted
            ? "fill-white text-white"
            : "text-white/70 hover:text-white"
        }`}
      />
    </button>
  )
}