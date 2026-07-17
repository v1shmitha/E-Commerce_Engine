import * as React from "react"

type Props = {
  orderNumber: string
  customerName: string
  storeName: string
}

export function ShippingUpdateEmail({
  orderNumber,
  customerName,
  storeName,
}: Props) {
  return (
    <html>
      <head />
      <body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#ffffff", margin: 0, padding: 0 }}>
        <table width="100%" cellPadding={0} cellSpacing={0}>
          <tr>
            <td align="center" style={{ padding: "40px 20px" }}>
              <table width="600" cellPadding={0} cellSpacing={0} style={{ maxWidth: "600px", width: "100%" }}>

                {/* Header */}
                <tr>
                  <td style={{ borderBottom: "1px solid #E0E0E0", paddingBottom: "24px" }}>
                    <p style={{ fontSize: "20px", fontWeight: "600", color: "#0A0A0A", margin: 0 }}>
                      {storeName}
                    </p>
                  </td>
                </tr>

                {/* Title */}
                <tr>
                  <td style={{ paddingTop: "32px", paddingBottom: "8px" }}>
                    <h1 style={{ fontSize: "28px", color: "#0A0A0A", margin: 0, fontWeight: "400" }}>
                      Your Order is on Its Way
                    </h1>
                  </td>
                </tr>

                {/* Body */}
                <tr>
                  <td style={{ paddingTop: "16px", paddingBottom: "24px" }}>
                    <p style={{ fontSize: "14px", color: "#6B6B6B", margin: 0, lineHeight: "1.6" }}>
                      Hi {customerName}, great news — your order has been dispatched and is on its way to you.
                    </p>
                  </td>
                </tr>

                {/* Order Number */}
                <tr>
                  <td style={{ backgroundColor: "#F2F2F2", padding: "16px" }}>
                    <p style={{ fontSize: "11px", color: "#8C8C8C", margin: "0 0 4px 0", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                      Order Number
                    </p>
                    <p style={{ fontSize: "16px", color: "#0A0A0A", margin: 0, fontWeight: "600" }}>
                      {orderNumber}
                    </p>
                  </td>
                </tr>

                {/* Message */}
                <tr>
                  <td style={{ paddingTop: "24px", paddingBottom: "24px" }}>
                    <p style={{ fontSize: "14px", color: "#6B6B6B", margin: 0, lineHeight: "1.6" }}>
                      You can track the status of your order by visiting your account. If you have any questions, feel free to reach out to us.
                    </p>
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td style={{ borderTop: "1px solid #E0E0E0", paddingTop: "24px" }}>
                    <p style={{ fontSize: "12px", color: "#8C8C8C", margin: 0, lineHeight: "1.6" }}>
                      Thank you for shopping with {storeName}.
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