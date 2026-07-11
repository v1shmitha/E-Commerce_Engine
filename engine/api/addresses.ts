"use server"

import { prisma } from "@/engine/lib/prisma"
import { createClient } from "@/engine/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createAddress(formData: FormData) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) redirect("/login")

  const isDefault = formData.get("isDefault") === "on"

  if (isDefault) {
    await prisma.address.updateMany({
      where: { customerId: data.user.id },
      data: { isDefault: false },
    })
  }

  await prisma.address.create({
    data: {
      customerId: data.user.id,
      label: formData.get("label") as string || undefined,
      fullName: formData.get("fullName") as string,
      phone: formData.get("phone") as string,
      addressLine1: formData.get("addressLine1") as string,
      addressLine2: formData.get("addressLine2") as string || undefined,
      city: formData.get("city") as string,
      district: formData.get("district") as string,
      province: formData.get("province") as string,
      postalCode: formData.get("postalCode") as string || undefined,
      isDefault,
    },
  })

  revalidatePath("/account/addresses")
}

export async function deleteAddress(addressId: string) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) return

  await prisma.address.delete({
    where: { id: addressId, customerId: data.user.id },
  })

  revalidatePath("/account/addresses")
}

export async function setDefaultAddress(addressId: string) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) return

  await prisma.address.updateMany({
    where: { customerId: data.user.id },
    data: { isDefault: false },
  })

  await prisma.address.update({
    where: { id: addressId, customerId: data.user.id },
    data: { isDefault: true },
  })

  revalidatePath("/account/addresses")
}