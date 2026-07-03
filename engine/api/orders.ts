"use server"

import { prisma } from "@/engine/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { OrderStatus, PaymentStatus } from "@prisma/client"

export async function updateOrder(orderId: string, formData: FormData) {
  const status = formData.get("status") as OrderStatus
  const paymentStatus = formData.get("paymentStatus") as PaymentStatus
  const notes = formData.get("notes") as string

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      paymentStatus,
      notes: notes || null,
    },
  })

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  redirect("/admin/orders")
}

export async function deleteOrder(orderId: string) {
  await prisma.order.delete({
    where: { id: orderId },
  })

  revalidatePath("/admin/orders")
  redirect("/admin/orders")
}
