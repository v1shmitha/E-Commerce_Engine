import { createClient } from "@/engine/lib/supabase/server"
import { prisma } from "@/engine/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { updateProfile } from "@/engine/api/account"

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) redirect("/login")

  const customer = await prisma.customer.findUnique({
    where: { id: data.user.id },
  })

  if (!customer) redirect("/login")

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <div className="flex items-center gap-3 mb-10">
        <Link href="/account" className="text-[11px] tracking-[0.1em] uppercase text-[#8C8C8C] hover:text-[#0A0A0A]">
          Account
        </Link>
        <span className="text-[#E0E0E0]">/</span>
        <span className="text-[11px] tracking-[0.1em] uppercase text-[#0A0A0A]">
          Profile
        </span>
      </div>

      <h1
        className="text-3xl text-[#0A0A0A] mb-8"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Profile Settings
      </h1>

      <form action={updateProfile} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C]">
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              defaultValue={customer.firstName}
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
              defaultValue={customer.lastName}
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
            defaultValue={customer.phone ?? ""}
            className="w-full border border-[#E0E0E0] px-3 py-2.5 text-sm text-[#0A0A0A] focus:border-[#0A0A0A] outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#0A0A0A] text-white py-3 text-[11px] font-medium tracking-[0.2em] uppercase hover:bg-[#2a2a2a] transition-colors"
        >
          Save Changes
        </button>
      </form>
    </div>
  )
}