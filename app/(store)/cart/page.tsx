"use client"

import { useCart } from "@/engine/hooks/useCart"
import Image from "next/image"
import Link from "next/link"

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart()

  function formatLKR(amount: number) {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h1
          className="text-3xl text-[#0A0A0A]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Your cart is empty
        </h1>
        <p className="mt-3 text-sm text-[#8C8C8C]">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-block bg-[#0A0A0A] text-white px-6 py-3 text-[11px] font-medium tracking-[0.2em] uppercase hover:bg-[#2a2a2a] transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  const cartTotal = total()
  const shippingFee = cartTotal >= 5000 ? 0 : 350
  const orderTotal = cartTotal + shippingFee

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1
        className="text-3xl md:text-4xl text-[#0A0A0A] mb-10"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Shopping Cart
      </h1>

      <div className="grid md:grid-cols-3 gap-12">

        {/* Items */}
        <div className="md:col-span-2 space-y-0 divide-y divide-[#E0E0E0]">
          {items.map((item) => (
            <div key={item.variantId} className="flex gap-5 py-6">
              <div className="relative w-20 h-28 bg-[#F2F2F2] shrink-0 overflow-hidden">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#F2F2F2]" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#0A0A0A]">
                      {item.productName}
                    </p>
                    <p className="text-xs text-[#8C8C8C] mt-0.5">
                      {item.size} / {item.colour}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-[#0A0A0A]">
                    {formatLKR(item.price * item.quantity)}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border border-[#E0E0E0]">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="w-8 h-8 text-[#8C8C8C] hover:text-[#0A0A0A] text-lg"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="w-8 h-8 text-[#8C8C8C] hover:text-[#0A0A0A] text-lg"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-[11px] tracking-[0.1em] uppercase text-[#8C8C8C] hover:text-[#0A0A0A] transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-[#F2F2F2] p-6 h-fit">
          <h2
            className="text-lg text-[#0A0A0A] mb-6"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Order Summary
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#8C8C8C]">Subtotal</span>
              <span className="text-[#0A0A0A]">{formatLKR(cartTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8C8C8C]">Shipping</span>
              <span className="text-[#0A0A0A]">
                {shippingFee === 0 ? "Free" : formatLKR(shippingFee)}
              </span>
            </div>
            {shippingFee > 0 && (
              <p className="text-xs text-[#8C8C8C]">
                Add {formatLKR(5000 - cartTotal)} more for free shipping
              </p>
            )}
            <div className="border-t border-[#E0E0E0] pt-3 flex justify-between font-medium">
              <span className="text-[#0A0A0A]">Total</span>
              <span className="text-[#0A0A0A]">{formatLKR(orderTotal)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="mt-6 block w-full bg-[#0A0A0A] text-white py-3.5 text-[11px] font-medium tracking-[0.2em] uppercase text-center hover:bg-[#2a2a2a] transition-colors"
          >
            Proceed to Checkout
          </Link>

          <Link
            href="/products"
            className="mt-3 block w-full border border-[#E0E0E0] bg-white text-[#0A0A0A] py-3.5 text-[11px] font-medium tracking-[0.2em] uppercase text-center hover:bg-[#F2F2F2] transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}