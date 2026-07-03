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

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const sortOrder = formData.get("sortOrder") as string
  const isActive = formData.get("isActive") === "on"

  await prisma.category.create({
    data: {
      name,
      slug: slugify(name),
      description: description || undefined,
      sortOrder: parseInt(sortOrder, 10) || 0,
      isActive,
    },
  })

  revalidatePath("/admin/categories")
  redirect("/admin/categories")
}

export async function updateCategory(categoryId: string, formData: FormData) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const sortOrder = formData.get("sortOrder") as string
  const isActive = formData.get("isActive") === "on"

  await prisma.category.update({
    where: { id: categoryId },
    data: {
      name,
      slug: slugify(name),
      description: description || undefined,
      sortOrder: parseInt(sortOrder, 10) || 0,
      isActive,
    },
  })

  revalidatePath("/admin/categories")
  redirect("/admin/categories")
}

export async function deleteCategory(categoryId: string) {
  await prisma.category.delete({ where: { id: categoryId } })
  revalidatePath("/admin/categories")
  redirect("/admin/categories")
}