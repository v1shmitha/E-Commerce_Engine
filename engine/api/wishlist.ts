"use server"

import { prisma } from "@/engine/lib/prisma"
import { createClient } from "@/engine/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function toggleWishlist(productId: string, currentPath: string) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) return { error: "Not logged in" }

  const existing = await prisma.wishlistItem.findUnique({
    where: {
      customerId_productId: {
        customerId: data.user.id,
        productId,
      },
    },
  })

  if (existing) {
    await prisma.wishlistItem.delete({
      where: {
        customerId_productId: {
          customerId: data.user.id,
          productId,
        },
      },
    })
  } else {
    await prisma.wishlistItem.create({
      data: {
        customerId: data.user.id,
        productId,
      },
    })
  }

  revalidatePath(currentPath)
}

export async function getWishlistIds(): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) return []

  const items = await prisma.wishlistItem.findMany({
    where: { customerId: data.user.id },
    select: { productId: true },
  })

  return items.map((i) => i.productId)
}