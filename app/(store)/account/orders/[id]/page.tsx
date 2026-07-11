import { createClient } from "@/engine/lib/supabase/server"
import { prisma } from "@/engine/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) redirect("/login")

  const order = await prisma.order.findUnique({
    where: { id, customerId: data.user.id },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: { where: { isPrimary: true }, take: 1 },
                },
              },
            },
          },
        },
      },
      shippingAddress: true,
      payment: true,
    },
  })

  if (!order) notFound()

  function formatLKR(amount: number) {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center gap-3 mb-10">
        <Link href="/account" className="text-[11px] tracking-[0.1em] uppercase text-[#8C8C8C] hover:text-[#0A0A0A]">
          Account
        </Link>
        <span className="text-[#E0E0E0]">/</span>
        <Link href="/account/orders" className="text-[11px] tracking-[0.1em] uppercase text-[#8C8C8C] hover:text-[#0A0A0A]">
          Orders
        </Link>
        <span className="text-[#E0E0E0]">/</span>
        <span className="text-[11px] tracking-[0.1em] uppercase text-[#0A0A0A]">
          {order.orderNumber}
        </span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1
            className="text-2xl md:text-3xl text-[#0A0A0A]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-[#8C8C8C]">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-LK", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="text-right space-y-1">
          <span
            className={`block text-[10px] tracking-[0.1em] uppercase px-3 py-1 ${
              order.status === "DELIVERED"
                ? "bg-green-50 text-green-600"
                : order.status === "CANCELLED"
                ? "bg-red-50 text-red-500"
                : order.status === "SHIPPED"
                ? "bg-blue-50 text-blue-600"
                : "bg-[#F2F2F2] text-[#8C8C8C]"
            }`}
          >
            {order.status}
          </span>
          <span
            className={`block text-[10px] tracking-[0.1em] uppercase px-3 py-1 ${
              order.paymentStatus === "COMPLETED"
                ? "bg-green-50 text-green-600"
                : order.paymentStatus === "FAILED"
                ? "bg-red-50 text-red-500"
                : "bg-[#F2F2F2] text-[#8C8C8C]"
            }`}
          >
            {order.paymentStatus}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="border border-[#E0E0E0] divide-y divide-[#E0E0E0] mb-6">
        {order.items.map((item) => {
          const attrs = item.variant.attributes as Record<string, string>
          const image = item.variant.product.images[0]
          return (
            <div key={item.id} className="flex gap-4 p-4">
              <div className="relative w-16 h-20 bg-[#F2F2F2] shrink-0">
                {image ? (
                  <Image
                    src={image.url}
                    alt={item.variant.product.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#F2F2F2]" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#0A0A0A]">
                  {item.variant.product.name}
                </p>
                <p className="text-xs text-[#8C8C8C] mt-0.5">
                  {attrs.size} / {attrs.colour}
                </p>
                <p className="text-xs text-[#8C8C8C] mt-0.5">
                  Qty: {item.quantity}
                </p>
              </div>
              <p className="text-sm font-medium text-[#0A0A0A]">
                {formatLKR(Number(item.totalPrice))}
              </p>
            </div>
          )
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Shipping Address */}
        <div className="border border-[#E0E0E0] p-5">
          <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C] mb-3">
            Shipping Address
          </p>
          <p className="text-sm font-medium text-[#0A0A0A]">
            {order.shippingAddress.fullName}
          </p>
          <p className="text-sm text-[#8C8C8C] mt-1">
            {order.shippingAddress.addressLine1}
          </p>
          {order.shippingAddress.addressLine2 && (
            <p className="text-sm text-[#8C8C8C]">
              {order.shippingAddress.addressLine2}
            </p>
          )}
          <p className="text-sm text-[#8C8C8C]">
            {order.shippingAddress.city}, {order.shippingAddress.district}
          </p>
          <p className="text-sm text-[#8C8C8C]">
            {order.shippingAddress.phone}
          </p>
        </div>

        {/* Payment Info */}
        <div className="border border-[#E0E0E0] p-5">
          <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C] mb-3">
            Payment
          </p>
          {order.payment?.payherePaymentId && (
            <p className="text-sm text-[#8C8C8C]">
              Reference: {order.payment.payherePaymentId}
            </p>
          )}
          {order.paymentMethod && (
            <p className="text-sm text-[#8C8C8C] mt-1">
              Method: {order.paymentMethod.replace("_", " ")}
            </p>
          )}
        </div>
      </div>

      {/* Order Summary */}
      <div className="border border-[#E0E0E0] p-5 space-y-2">
        <div className="flex justify-between text-sm text-[#8C8C8C]">
          <span>Subtotal</span>
          <span>{formatLKR(Number(order.subtotal))}</span>
        </div>
        <div className="flex justify-between text-sm text-[#8C8C8C]">
          <span>Shipping</span>
          <span>
            {Number(order.shippingFee) === 0
              ? "Free"
              : formatLKR(Number(order.shippingFee))}
          </span>
        </div>
        {Number(order.discount) > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span>{formatLKR(Number(order.discount))}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-medium text-[#0A0A0A] border-t border-[#E0E0E0] pt-2">
          <span>Total</span>
          <span>{formatLKR(Number(order.total))}</span>
        </div>
      </div>
    </div>
  )
}