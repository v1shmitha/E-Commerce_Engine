"use client"

import { useState } from "react"
import { toast } from "sonner"
import { updateProfile } from "@/engine/api/account"

type ProfileFields = {
  firstName: string
  lastName: string
  phone: string
}

export function ProfileForm({
  customer,
}: {
  customer: { firstName: string; lastName: string; email: string; phone: string | null }
}) {
  const initial: ProfileFields = {
    firstName: customer.firstName,
    lastName: customer.lastName,
    phone: customer.phone ?? "",
  }

  const [fields, setFields] = useState(initial)
  // Tracks the last successfully-saved values, so the button re-disables
  // after a save instead of staying enabled until the next page load.
  const [saved, setSaved] = useState(initial)
  const [saving, setSaving] = useState(false)

  const isDirty =
    fields.firstName !== saved.firstName ||
    fields.lastName !== saved.lastName ||
    fields.phone !== saved.phone

  async function handleSubmit(formData: FormData) {
    setSaving(true)
    const result = await updateProfile(formData)
    setSaving(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Profile updated")
      setSaved(fields)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="firstName" className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C]">
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            value={fields.firstName}
            onChange={(e) => setFields((f) => ({ ...f, firstName: e.target.value }))}
            required
            className="w-full border border-[#E0E0E0] px-3 py-2.5 text-sm text-[#0A0A0A] focus:border-[#0A0A0A] outline-none transition-colors"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="lastName" className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C]">
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            value={fields.lastName}
            onChange={(e) => setFields((f) => ({ ...f, lastName: e.target.value }))}
            required
            className="w-full border border-[#E0E0E0] px-3 py-2.5 text-sm text-[#0A0A0A] focus:border-[#0A0A0A] outline-none transition-colors"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C]">
          Email
        </label>
        <input
          value={customer.email}
          disabled
          className="w-full border border-[#E0E0E0] px-3 py-2.5 text-sm text-[#8C8C8C] bg-[#F2F2F2] cursor-not-allowed"
        />
        <p className="text-xs text-[#8C8C8C]">
          Email cannot be changed.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C]">
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          value={fields.phone}
          onChange={(e) => setFields((f) => ({ ...f, phone: e.target.value }))}
          className="w-full border border-[#E0E0E0] px-3 py-2.5 text-sm text-[#0A0A0A] focus:border-[#0A0A0A] outline-none transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={saving || !isDirty}
        aria-busy={saving}
        className="w-full bg-[#0A0A0A] text-white py-3 text-[11px] font-medium tracking-[0.2em] uppercase hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  )
}
