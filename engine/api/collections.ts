"use server"

import { prisma } from "@/engine/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

export async function createCollection(formData: FormData) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const sortOrder = formData.get("sortOrder") as string
  const isActive = formData.get("isActive") === "on"

  await prisma.collection.create({
    data: {
      name,
      slug: slugify(name),
      description: description || undefined,
      sortOrder: parseInt(sortOrder, 10) || 0,
      isActive,
    },
  })

  revalidatePath("/admin/collections")
  redirect("/admin/collections")
}

export async function updateCollection(
  collectionId: string,
  formData: FormData
) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const sortOrder = formData.get("sortOrder") as string
  const isActive = formData.get("isActive") === "on"

  await prisma.collection.update({
    where: { id: collectionId },
    data: {
      name,
      slug: slugify(name),
      description: description || undefined,
      sortOrder: parseInt(sortOrder, 10) || 0,
      isActive,
    },
  })

  revalidatePath("/admin/collections")
  redirect("/admin/collections")
}

export async function deleteCollection(collectionId: string) {
  await prisma.collection.delete({ where: { id: collectionId } })
  revalidatePath("/admin/collections")
  redirect("/admin/collections")
}

export async function assignProductToCollection(
  collectionId: string,
  productId: string
) {
  await prisma.productCollection.create({
    data: { collectionId, productId },
  })
  revalidatePath(`/admin/collections/${collectionId}`)
}

export async function removeProductFromCollection(
  collectionId: string,
  productId: string
) {
  await prisma.productCollection.delete({
    where: {
      productId_collectionId: { productId, collectionId },
    },
  })
  revalidatePath(`/admin/collections/${collectionId}`)
}