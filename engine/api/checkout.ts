"use server"

import { prisma } from "@/engine/lib/prisma"

function generateOrderNumber(): string {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "")
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `ORD-${dateStr}-${random}`
}

export async function createCheckoutOrder({
  customerId,
  items,
  shippingAddress,
  existingAddressId,
  subtotal,
  shippingFee,
  total,
}: {
  customerId: string
  items: { variantId: string; quantity: number; unitPrice: number }[]
  shippingAddress: {
    fullName: string
    phone: string
    addressLine1: string
    addressLine2?: string | null
    city: string
    district: string
    province: string
    postalCode?: string | null
  }
  existingAddressId?: string | null
  subtotal: number
  shippingFee: number
  total: number
}) {
  try {
    // Use existing address or create a new one
    let addressId: string

    if (existingAddressId) {
      addressId = existingAddressId
    } else {
      const address = await prisma.address.create({
        data: {
          customerId,
          fullName: shippingAddress.fullName,
          phone: shippingAddress.phone,
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2 || undefined,
          city: shippingAddress.city,
          district: shippingAddress.district,
          province: shippingAddress.province,
          postalCode: shippingAddress.postalCode || undefined,
        },
      })
      addressId = address.id
    }

    const orderNumber = generateOrderNumber()
    const payhereOrderId = `${orderNumber}-${Date.now()}`

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        shippingAddressId: addressId,
        status: "PENDING",
        paymentStatus: "PENDING",
        subtotal,
        shippingFee,
        discount: 0,
        total,
        items: {
          create: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
          })),
        },
      },
    })

    await prisma.payment.create({
      data: {
        orderId: order.id,
        payhereOrderId,
        amount: total,
        currency: "LKR",
        status: "PENDING",
      },
    })

    return { orderId: order.id, payhereOrderId, error: null }
  } catch (err) {
    console.error("Checkout order creation failed:", err)
    return { orderId: null, payhereOrderId: null, error: "Failed to create order" }
  }
}