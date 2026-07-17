import * as React from "react"

type OrderItem = {
  productName: string
  size: string
  colour: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

type Props = {
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
}

function formatLKR(amount: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function OrderConfirmationEmail({
  orderNumber,
  customerName,
  items,
  subtotal,
  shippingFee,
  total,
  shippingAddress,
}: Props) {
  return (
    <html>
      <head />
      <body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#ffffff", margin: 0, padding: 0 }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: "#ffffff" }}>
          <tr>
            <td align="center" style={{ padding: "40px 20px" }}>
              <table width="600" cellPadding={0} cellSpacing={0} style={{ maxWidth: "600px", width: "100%" }}>

                {/* Header */}
                <tr>
                  <td style={{ borderBottom: "1px solid #E0E0E0", paddingBottom: "24px", marginBottom: "24px" }}>
                    <p style={{ fontSize: "20px", fontWeight: "600", color: "#0A0A0A", margin: 0 }}>
                      {process.env.RESEND_FROM_NAME}
                    </p>
                  </td>
                </tr>

                {/* Title */}
                <tr>
                  <td style={{ paddingTop: "32px", paddingBottom: "8px" }}>
                    <h1 style={{ fontSize: "28px", color: "#0A0A0A", margin: 0, fontWeight: "400" }}>
                      Order Confirmed
                    </h1>
                  </td>
                </tr>

                {/* Greeting */}
                <tr>
                  <td style={{ paddingTop: "16px", paddingBottom: "24px" }}>
                    <p style={{ fontSize: "14px", color: "#6B6B6B", margin: 0, lineHeight: "1.6" }}>
                      Hi {customerName}, thank you for your order. We have received your payment and are preparing your items.
                    </p>
                  </td>
                </tr>

                {/* Order Number */}
                <tr>
                  <td style={{ backgroundColor: "#F2F2F2", padding: "16px", marginBottom: "24px" }}>
                    <p style={{ fontSize: "11px", color: "#8C8C8C", margin: "0 0 4px 0", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                      Order Number
                    </p>
                    <p style={{ fontSize: "16px", color: "#0A0A0A", margin: 0, fontWeight: "600" }}>
                      {orderNumber}
                    </p>
                  </td>
                </tr>

                {/* Items */}
                <tr>
                  <td style={{ paddingTop: "24px" }}>
                    <p style={{ fontSize: "11px", color: "#8C8C8C", margin: "0 0 12px 0", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                      Items Ordered
                    </p>
                    <table width="100%" cellPadding={0} cellSpacing={0}>
                      {items.map((item, index) => (
                        <tr key={index} style={{ borderBottom: "1px solid #E0E0E0" }}>
                          <td style={{ padding: "12px 0" }}>
                            <p style={{ fontSize: "14px", color: "#0A0A0A", margin: "0 0 4px 0", fontWeight: "500" }}>
                              {item.productName}
                            </p>
                            <p style={{ fontSize: "12px", color: "#8C8C8C", margin: 0 }}>
                              {item.size} / {item.colour} · Qty {item.quantity}
                            </p>
                          </td>
                          <td align="right" style={{ padding: "12px 0" }}>
                            <p style={{ fontSize: "14px", color: "#0A0A0A", margin: 0 }}>
                              {formatLKR(item.totalPrice)}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </table>
                  </td>
                </tr>

                {/* Totals */}
                <tr>
                  <td style={{ paddingTop: "16px", paddingBottom: "24px" }}>
                    <table width="100%" cellPadding={0} cellSpacing={0}>
                      <tr>
                        <td style={{ padding: "4px 0" }}>
                          <p style={{ fontSize: "13px", color: "#8C8C8C", margin: 0 }}>Subtotal</p>
                        </td>
                        <td align="right">
                          <p style={{ fontSize: "13px", color: "#8C8C8C", margin: 0 }}>{formatLKR(subtotal)}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "4px 0" }}>
                          <p style={{ fontSize: "13px", color: "#8C8C8C", margin: 0 }}>Shipping</p>
                        </td>
                        <td align="right">
                          <p style={{ fontSize: "13px", color: "#8C8C8C", margin: 0 }}>
                            {shippingFee === 0 ? "Free" : formatLKR(shippingFee)}
                          </p>
                        </td>
                      </tr>
                      <tr style={{ borderTop: "1px solid #E0E0E0" }}>
                        <td style={{ paddingTop: "12px" }}>
                          <p style={{ fontSize: "14px", color: "#0A0A0A", margin: 0, fontWeight: "600" }}>Total</p>
                        </td>
                        <td align="right" style={{ paddingTop: "12px" }}>
                          <p style={{ fontSize: "14px", color: "#0A0A0A", margin: 0, fontWeight: "600" }}>{formatLKR(total)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                {/* Shipping Address */}
                <tr>
                  <td style={{ borderTop: "1px solid #E0E0E0", paddingTop: "24px", paddingBottom: "24px" }}>
                    <p style={{ fontSize: "11px", color: "#8C8C8C", margin: "0 0 12px 0", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                      Shipping To
                    </p>
                    <p style={{ fontSize: "14px", color: "#0A0A0A", margin: "0 0 4px 0", fontWeight: "500" }}>
                      {shippingAddress.fullName}
                    </p>
                    <p style={{ fontSize: "13px", color: "#8C8C8C", margin: "0 0 2px 0" }}>
                      {shippingAddress.addressLine1}
                    </p>
                    {shippingAddress.addressLine2 && (
                      <p style={{ fontSize: "13px", color: "#8C8C8C", margin: "0 0 2px 0" }}>
                        {shippingAddress.addressLine2}
                      </p>
                    )}
                    <p style={{ fontSize: "13px", color: "#8C8C8C", margin: "0 0 2px 0" }}>
                      {shippingAddress.city}, {shippingAddress.district}
                    </p>
                    <p style={{ fontSize: "13px", color: "#8C8C8C", margin: 0 }}>
                      {shippingAddress.phone}
                    </p>
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td style={{ borderTop: "1px solid #E0E0E0", paddingTop: "24px" }}>
                    <p style={{ fontSize: "12px", color: "#8C8C8C", margin: 0, lineHeight: "1.6" }}>
                      If you have any questions about your order, please contact us. Thank you for shopping with us.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  )
}