import Link from "next/link"

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <h1
        className="text-3xl text-[#0A0A0A]"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Payment Cancelled
      </h1>
      <p className="mt-3 text-sm text-[#8C8C8C]">
        Your payment was cancelled. Your cart has been saved.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/cart"
          className="bg-[#0A0A0A] text-white px-6 py-3 text-[11px] font-medium tracking-[0.2em] uppercase hover:bg-[#2a2a2a] transition-colors"
        >
          Return to Cart
        </Link>
        <Link
          href="/products"
          className="border border-[#E0E0E0] px-6 py-3 text-[11px] font-medium tracking-[0.2em] uppercase text-[#0A0A0A] hover:border-[#0A0A0A] transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}