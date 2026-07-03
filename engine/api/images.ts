"use server"

import { prisma } from "@/engine/lib/prisma"
import { createClient } from "@/engine/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function uploadProductImage(
  productId: string,
  formData: FormData
) {
  const file = formData.get("file") as File

  if (!file || file.size === 0) {
    return { error: "No file selected" }
  }

  const supabase = await createClient()

  const fileExt = file.name.split(".").pop()
  const fileName = `${productId}-${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

  if (uploadError) {
    return { error: uploadError.message }
  }

  const { data: publicUrlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(fileName)

  // Check if this product already has a primary image
  const existingPrimary = await prisma.image.findFirst({
    where: { productId, isPrimary: true },
  })

  await prisma.image.create({
    data: {
      productId,
      url: publicUrlData.publicUrl,
      altText: file.name,
      isPrimary: !existingPrimary,
    },
  })

  revalidatePath(`/admin/products/${productId}`)
  return { success: true }
}

export async function deleteProductImage(imageId: string, productId: string) {
  const image = await prisma.image.findUnique({ where: { id: imageId } })

  if (image) {
    const fileName = image.url.split("/").pop()
    const supabase = await createClient()

    if (fileName) {
      await supabase.storage.from("product-images").remove([fileName])
    }

    await prisma.image.delete({ where: { id: imageId } })
  }

  revalidatePath(`/admin/products/${productId}`)
}

export async function setPrimaryImage(imageId: string, productId: string) {
  await prisma.image.updateMany({
    where: { productId },
    data: { isPrimary: false },
  })

  await prisma.image.update({
    where: { id: imageId },
    data: { isPrimary: true },
  })

  revalidatePath(`/admin/products/${productId}`)
}