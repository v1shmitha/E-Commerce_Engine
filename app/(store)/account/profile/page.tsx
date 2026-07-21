import { createClient } from "@/engine/lib/supabase/server"
import { prisma } from "@/engine/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ProfileForm } from "@/engine/components/account/ProfileForm"

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

      <ProfileForm customer={customer} />
    </div>
  )
}