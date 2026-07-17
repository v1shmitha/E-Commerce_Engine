import { NextRequest, NextResponse } from "next/server";
import { verifyPayHereHash, formatAmount } from "@/engine/lib/payhere";
import { prisma } from "@/engine/lib/prisma";
import { sendOrderConfirmationEmail } from "@/engine/lib/email";
import { storeConfig } from "@/engine/lib/config";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const merchantId = formData.get("merchant_id") as string;
  const orderId = formData.get("order_id") as string;
  const payherePaymentId = formData.get("payment_id") as string;
  const statusCode = formData.get("status_code") as string;
  const statusMessage = formData.get("status_message") as string;
  const amount = formData.get("payhere_amount") as string;
  const currency = formData.get("payhere_currency") as string;
  const md5sig = formData.get("md5sig") as string;
  const method = formData.get("method") as string;

  // Verify the hash
  const isValid = verifyPayHereHash({
    merchantId,
    orderId,
    amount,
    currency,
    statusCode,
    merchantSecret: process.env.PAYHERE_MERCHANT_SECRET!,
    receivedHash: md5sig,
  });

  if (!isValid) {
    console.error("PayHere hash verification failed for order:", orderId);
    return NextResponse.json({ error: "Invalid hash" }, { status: 400 });
  }

  // Find the pending payment record
  const payment = await prisma.payment.findUnique({
    where: { payhereOrderId: orderId },
    include: { order: { include: { items: true } } },
  });

  if (!payment) {
    console.error("Payment record not found for order:", orderId);
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  const statusCodeNum = parseInt(statusCode, 10);

  // Map PayHere status codes
  const paymentStatus =
    statusCodeNum === 2
      ? "COMPLETED"
      : statusCodeNum === 0
        ? "FAILED"
        : statusCodeNum === -1
          ? "CANCELLED"
          : statusCodeNum === -2
            ? "CHARGEDBACK"
            : "PENDING";

  const orderStatus =
    statusCodeNum === 2
      ? "PROCESSING"
      : statusCodeNum === -1
        ? "CANCELLED"
        : "PENDING";

  // Map payment method
  const methodMap: Record<string, string> = {
    VISA: "CARD",
    MASTER: "CARD",
    AMEX: "CARD",
    "eZ Cash": "EZ_CASH",
    mCash: "EZ_CASH",
    Genie: "GENIE",
    FriMi: "FRIMI",
    iPay: "IPAY",
    HelaPay: "HELAPAY",
  };
  const mappedMethod = methodMap[method] ?? "OTHER";

  // Update payment record
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      payherePaymentId,
      status: paymentStatus as any,
      method: mappedMethod as any,
      statusCode: statusCodeNum,
      statusMessage,
      notifyReceivedAt: new Date(),
    },
  });

  // Update order status
  await prisma.order.update({
    where: { id: payment.orderId },
    data: {
      status: orderStatus as any,
      paymentStatus: paymentStatus as any,
      paymentMethod: mappedMethod as any,
    },
  });

  // Decrement stock on successful payment only
  if (statusCodeNum === 2) {
    for (const item of payment.order.items) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }
  }
  
  if (statusCodeNum === 2) {
    const fullOrder = await prisma.order.findUnique({
      where: { id: payment.orderId },
      include: {
        customer: true,
        shippingAddress: true,
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
      },
    });

    if (fullOrder) {
      await sendOrderConfirmationEmail({
        to: fullOrder.customer.email,
        orderNumber: fullOrder.orderNumber,
        customerName: `${fullOrder.customer.firstName} ${fullOrder.customer.lastName}`,
        items: fullOrder.items.map((item) => {
          const attrs = item.variant.attributes as Record<string, string>;
          return {
            productName: item.variant.product.name,
            size: attrs.size ?? "",
            colour: attrs.colour ?? "",
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            totalPrice: Number(item.totalPrice),
          };
        }),
        subtotal: Number(fullOrder.subtotal),
        shippingFee: Number(fullOrder.shippingFee),
        total: Number(fullOrder.total),
        shippingAddress: {
          fullName: fullOrder.shippingAddress.fullName,
          addressLine1: fullOrder.shippingAddress.addressLine1,
          addressLine2: fullOrder.shippingAddress.addressLine2,
          city: fullOrder.shippingAddress.city,
          district: fullOrder.shippingAddress.district,
          phone: fullOrder.shippingAddress.phone,
        },
      });
    }
  }

  console.log(`PayHere notify: order ${orderId} → ${paymentStatus}`);

  return NextResponse.json({ status: "ok" });
}
