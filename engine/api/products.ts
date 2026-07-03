"use server"

import { prisma } from "@/engine/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const categoryId = formData.get("categoryId") as string
  const basePrice = formData.get("basePrice") as string
  const isActive = formData.get("isActive") === "on"
  const isFeatured = formData.get("isFeatured") === "on"
  const material = formData.get("material") as string
  const careInstructions = formData.get("careInstructions") as string

  await prisma.product.create({
    data: {
      name,
      slug: slugify(name),
      description,
      categoryId,
      basePrice: parseFloat(basePrice),
      isActive,
      isFeatured,
      metadata: {
        material: material || undefined,
        careInstructions: careInstructions || undefined,
      },
    },
  })

  revalidatePath("/admin/products")
  redirect("/admin/products")
}

export async function updateProduct(productId: string, formData: FormData) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const categoryId = formData.get("categoryId") as string
  const basePrice = formData.get("basePrice") as string
  const isActive = formData.get("isActive") === "on"
  const isFeatured = formData.get("isFeatured") === "on"
  const material = formData.get("material") as string
  const careInstructions = formData.get("careInstructions") as string

  await prisma.product.update({
    where: { id: productId },
    data: {
      name,
      slug: slugify(name),
      description,
      categoryId,
      basePrice: parseFloat(basePrice),
      isActive,
      isFeatured,
      metadata: {
        material: material || undefined,
        careInstructions: careInstructions || undefined,
      },
    },
  })

  revalidatePath("/admin/products")
  redirect("/admin/products")
}

export async function deleteProduct(productId: string) {
  await prisma.product.delete({ where: { id: productId } })
  revalidatePath("/admin/products")
  redirect("/admin/products")
}

export async function createVariant(productId: string, formData: FormData) {
  const size = formData.get("size") as string
  const colour = formData.get("colour") as string
  const colourHex = formData.get("colourHex") as string
  const sku = formData.get("sku") as string
  const stock = formData.get("stock") as string
  const price = formData.get("price") as string

  await prisma.productVariant.create({
    data: {
      productId,
      sku,
      stock: parseInt(stock, 10),
      price: parseFloat(price),
      attributes: {
        size,
        colour,
        colourHex: colourHex || undefined,
      },
    },
  })

  revalidatePath(`/admin/products/${productId}`)
}

export async function updateVariant(
  variantId: string,
  productId: string,
  formData: FormData
) {
  const size = formData.get("size") as string
  const colour = formData.get("colour") as string
  const colourHex = formData.get("colourHex") as string
  const sku = formData.get("sku") as string
  const stock = formData.get("stock") as string
  const price = formData.get("price") as string

  await prisma.productVariant.update({
    where: { id: variantId },
    data: {
      sku,
      stock: parseInt(stock, 10),
      price: parseFloat(price),
      attributes: {
        size,
        colour,
        colourHex: colourHex || undefined,
      },
    },
  })

  revalidatePath(`/admin/products/${productId}`)
}

export async function deleteVariant(variantId: string, productId: string) {
  await prisma.productVariant.delete({ where: { id: variantId } })
  revalidatePath(`/admin/products/${productId}`)
}