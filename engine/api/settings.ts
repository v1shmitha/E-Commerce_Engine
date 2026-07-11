"use server"

import { prisma } from "@/engine/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getSettings() {
  const settings = await prisma.storeSetting.findMany()
  return Object.fromEntries(settings.map((s) => [s.key, s.value]))
}

export async function updateSettings(formData: FormData) {
  const fields = [
    "store_name",
    "shipping_flat_rate",
    "shipping_free_threshold",
    "primary_color",
    "accent_color",
  ]

  for (const field of fields) {
    const value = formData.get(field) as string
    if (value !== null) {
      await prisma.storeSetting.upsert({
        where: { key: field },
        update: { value },
        create: { key: field, value },
      })
    }
  }

  revalidatePath("/admin/settings")
}