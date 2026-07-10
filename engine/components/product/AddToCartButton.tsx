"use client"

import { useState } from "react"
import { useCart } from "@/engine/hooks/useCart"

type Variant = {
  id: string
  sku: string
  stock: number
  price: number
  attributes: unknown
}

type Product = {
  id: string
  name: string
  slug: string
  basePrice: number
  image: string | null
}

export default function AddToCartButton({
  product,
  variants,
  sizes,
  colours,
}: {
  product: Product
  variants: Variant[]
  sizes: string[]
  colours: string[]
}) {
  const { addItem } = useCart()
  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizes[0] ?? null
  )
  const [selectedColour, setSelectedColour] = useState<string | null>(
    colours[0] ?? null
  )
  const [added, setAdded] = useState(false)

  const selectedVariant = variants.find((v) => {
    const attrs = v.attributes as Record<string, string>
    return attrs.size === selectedSize && attrs.colour === selectedColour
  })

  const outOfStock = selectedVariant ? selectedVariant.stock === 0 : true

  function handleAddToCart() {
    if (!selectedVariant || outOfStock) return

    const attrs = selectedVariant.attributes as Record<string, string>

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      sku: selectedVariant.sku,
      size: attrs.size ?? "",
      colour: attrs.colour ?? "",
      price: selectedVariant.price,
      quantity: 1,
      imageUrl: product.image,
    })

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="space-y-5">

      {/* Size selector */}
      {sizes.length > 0 && (
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#8C8C8C] mb-3">
            Size
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const hasStock = variants.some((v) => {
                const attrs = v.attributes as Record<string, string>
                return (
                  attrs.size === s &&
                  attrs.colour === selectedColour &&
                  v.stock > 0
                )
              })
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  className={`w-11 h-11 text-xs border transition-colors ${
                    selectedSize === s
                      ? "bg-[#0A0A0A] text-white border-[#0A0A0A]"
                      : hasStock
                      ? "border-[#E0E0E0] text-[#0A0A0A] hover:border-[#0A0A0A]"
                      : "border-[#E0E0E0] text-[#E0E0E0] cursor-not-allowed"
                  }`}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Colour selector */}
      {colours.length > 0 && (
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#8C8C8C] mb-3">
            Colour — <span className="normal-case tracking-normal text-[#0A0A0A]">{selectedColour}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {colours.map((c) => {
              const variant = variants.find((v) => {
                const attrs = v.attributes as Record<string, string>
                return attrs.colour === c
              })
              const hex = variant
                ? (variant.attributes as Record<string, string>).colourHex
                : null

              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColour(c)}
                  title={c}
                  className={`w-8 h-8 border-2 transition-all ${
                    selectedColour === c
                      ? "border-[#0A0A0A] scale-110"
                      : "border-transparent hover:border-[#8C8C8C]"
                  }`}
                  style={{ backgroundColor: hex ?? "#E0E0E0" }}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Stock info */}
      {selectedVariant && (
        <p className="text-xs text-[#8C8C8C]">
          {selectedVariant.stock === 0
            ? "Out of stock"
            : selectedVariant.stock <= 3
            ? `Only ${selectedVariant.stock} left`
            : "In stock"}
        </p>
      )}

      {/* Add to cart */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={outOfStock || !selectedVariant}
        className={`w-full py-3.5 text-[11px] font-medium tracking-[0.2em] uppercase transition-colors ${
          added
            ? "bg-[#4a4a4a] text-white cursor-default"
            : outOfStock || !selectedVariant
            ? "bg-[#F2F2F2] text-[#8C8C8C] cursor-not-allowed"
            : "bg-[#0A0A0A] text-white hover:bg-[#2a2a2a]"
        }`}
      >
        {added ? "Added to Cart" : outOfStock ? "Out of Stock" : "Add to Cart"}
      </button>
    </div>
  )
}