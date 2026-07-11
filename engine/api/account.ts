"use server"

import { prisma } from "@/engine/lib/prisma"
import { createClient } from "@/engine/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) redirect("/login")

  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const phone = formData.get("phone") as string

  await prisma.customer.update({
    where: { id: data.user.id },
    data: {
      firstName,
      lastName,
      phone: phone || null,
    },
  })

  revalidatePath("/account/profile")
  revalidatePath("/account")
}