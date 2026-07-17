import Link from "next/link"

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { order?: string }
}) {
  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <div className="w-12 h-12 bg-[#0A0A0A] rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1
        className="text-3xl text-[#0A0A0A]"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Order Confirmed
      </h1>
      <p className="mt-3 text-sm text-[#8C8C8C]">
        Thank you for your purchase. Your order is being processed.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/account/orders"
          className="bg-[#0A0A0A] text-white px-6 py-3 text-[11px] font-medium tracking-[0.2em] uppercase hover:bg-[#2a2a2a] transition-colors"
        >
          View Orders
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