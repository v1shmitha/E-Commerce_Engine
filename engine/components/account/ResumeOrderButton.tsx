"use client"

import { useCart } from "@/engine/hooks/useCart"
import { useRouter } from "next/navigation"
import type { CartItem } from "@/engine/hooks/useCart"

export function ResumeOrderButton({ items }: { items: CartItem[] }) {
  const { clearCart, addItem } = useCart()
  const router = useRouter()

  function handleResume() {
    clearCart()
    items.forEach((item) => addItem(item))
    router.push("/checkout")
  }

  return (
    <button
      onClick={handleResume}
      className="text-[11px] tracking-[0.1em] uppercase text-[#0A0A0A] border-b border-[#0A0A0A] hover:text-[#8C8C8C] hover:border-[#8C8C8C] transition-colors"
    >
      Complete Payment
    </button>
  )
}