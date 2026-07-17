import { resend, FROM_EMAIL } from "@/engine/lib/resend"
import { OrderConfirmationEmail } from "@/engine/emails/OrderConfirmationEmail"
import { ShippingUpdateEmail } from "@/engine/emails/ShippingUpdateEmail"
import * as React from "react"
import { render } from "react-email"

type OrderItem = {
  productName: string
  size: string
  colour: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export async function sendOrderConfirmationEmail({
  to,
  orderNumber,
  customerName,
  items,
  subtotal,
  shippingFee,
  total,
  shippingAddress,
}: {
  to: string
  orderNumber: string
  customerName: string
  items: OrderItem[]
  subtotal: number
  shippingFee: number
  total: number
  shippingAddress: {
    fullName: string
    addressLine1: string
    addressLine2?: string | null
    city: string
    district: string
    phone: string
  }
}) {
  try {
    const html = await render(
      React.createElement(OrderConfirmationEmail, {
        orderNumber,
        customerName,
        items,
        subtotal,
        shippingFee,
        total,
        shippingAddress,
      })
    )

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Order Confirmed — ${orderNumber}`,
      html,
    })

    console.log(`Order confirmation email sent to ${to}`)
  } catch (err) {
    console.error("Failed to send order confirmation email:", err)
  }
}

export async function sendShippingUpdateEmail({
  to,
  orderNumber,
  customerName,
  storeName,
}: {
  to: string
  orderNumber: string
  customerName: string
  storeName: string
}) {
  try {
    const html = await render(
      React.createElement(ShippingUpdateEmail, {
        orderNumber,
        customerName,
        storeName,
      })
    )

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your Order is on Its Way — ${orderNumber}`,
      html,
    })

    console.log(`Shipping update email sent to ${to}`)
  } catch (err) {
    console.error("Failed to send shipping update email:", err)
  }
}