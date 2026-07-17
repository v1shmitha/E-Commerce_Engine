"use client"

import { useState } from "react"

export function DeleteAddressForm({
  deleteAction,
}: {
  deleteAction: () => Promise<{ error?: string } | undefined>
}) {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!confirm("Delete this address?")) return
    setError(null)
    const result = await deleteAction()
    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <button
          type="submit"
          className="text-[11px] tracking-[0.1em] uppercase text-red-400 hover:text-red-600 transition-colors"
        >
          Delete
        </button>
      </form>
      {error && (
        <p className="mt-1 text-[10px] text-red-500 max-w-[160px]">{error}</p>
      )}
    </div>
  )
}