"use client"

import { useState } from "react"
import { cancelOrder } from "@/engine/api/orders"

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this order?")) return
    setLoading(true)
    setError(null)
    const result = await cancelOrder(orderId)
    if (result?.error) {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div>
      <button
        onClick={handleCancel}
        disabled={loading}
        className="text-[11px] tracking-[0.1em] uppercase text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
      >
        {loading ? "Cancelling..." : "Cancel Order"}
      </button>
      {error && (
        <p className="mt-1 text-[10px] text-red-500">{error}</p>
      )}
    </div>
  )
}