"use server";

import { prisma } from "@/engine/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/engine/lib/supabase/server";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { sendShippingUpdateEmail } from "@/engine/lib/email";
import { storeConfig } from "@/engine/lib/config";

export async function updateOrder(orderId: string, formData: FormData) {
  const status = formData.get("status") as OrderStatus;
  const paymentStatus = formData.get("paymentStatus") as PaymentStatus;
  const notes = formData.get("notes") as string;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "CANCELLED",
      paymentStatus: "CANCELLED",
    },
  });

  if (status === "SHIPPED") {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });

    if (order) {
      await sendShippingUpdateEmail({
        to: order.customer.email,
        orderNumber: order.orderNumber,
        customerName: `${order.customer.firstName} ${order.customer.lastName}`,
        storeName: storeConfig.name,
      });
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  redirect("/admin/orders");
}

export async function deleteOrder(orderId: string) {
  await prisma.order.delete({
    where: { id: orderId },
  });

  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}

export async function cancelOrder(orderId: string) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) return { error: "Not logged in" };

  const order = await prisma.order.findUnique({
    where: { id: orderId, customerId: data.user.id },
    select: { status: true, paymentStatus: true },
  });

  if (!order) return { error: "Order not found" };

  if (!["PENDING", "FAILED"].includes(order.paymentStatus)) {
    return { error: "This order cannot be cancelled." };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/account/orders");
  return { success: true };
}
