"use client"

import { useState } from "react"
import { signOut } from "@/engine/api/auth"

export function AdminSignOutButton() {
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
      className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
    >
      {loading ? "Signing out..." : "Sign Out"}
    </button>
  )
}
