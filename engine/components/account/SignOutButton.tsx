"use client"

import { useState } from "react"
import { signOut } from "@/engine/api/auth"

export function SignOutButton() {
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    if (!confirm("Are you sure you want to sign out?")) return
    setLoading(true)
    await signOut()
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="text-[11px] tracking-[0.15em] uppercase text-[#8C8C8C] hover:text-[#0A0A0A] border-b border-[#8C8C8C] hover:border-[#0A0A0A] transition-colors disabled:opacity-50"
    >
      {loading ? "Signing out..." : "Sign Out"}
    </button>
  )
}
