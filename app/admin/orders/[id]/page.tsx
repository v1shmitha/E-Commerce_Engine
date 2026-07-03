import { prisma } from "@/engine/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, User, Phone, Mail, MapPin, CreditCard } from "lucide-react"
import { OrderStatus, PaymentStatus } from "@prisma/client"
import { updateOrder, deleteOrder } from "@/engine/api/orders"
import { DeleteOrderForm } from "@/engine/components/orders/DeleteOrderForm"

function formatLKR(amount: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      shippingAddress: true,
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: {
                    where: { isPrimary: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      },
      payment: true,
    },
  })

  if (!order) {
    notFound()
  }

  const updateWithId = updateOrder.bind(null, order.id)
  const deleteWithId = deleteOrder.bind(null, order.id)

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Order {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${
              order.status === OrderStatus.DELIVERED
                ? "bg-green-50 text-green-700 border-green-200"
                : order.status === OrderStatus.PENDING
                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                : "bg-blue-50 text-blue-700 border-blue-200"
            }`}
          >
            Order: {order.status}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
              order.paymentStatus === PaymentStatus.COMPLETED
                ? "bg-green-100 text-green-800"
                : order.paymentStatus === PaymentStatus.PENDING
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            Payment: {order.paymentStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Columns */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
            <div className="border-b px-6 py-4">
              <h2 className="font-semibold text-gray-900">Items</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {order.items.map((item) => {
                const attrs = item.variant.attributes as Record<string, string>
                const attrString = Object.entries(attrs || {})
                  .map(([key, val]) => `${key}: ${val}`)
                  .join(", ")
                const image = item.variant.product.images[0]

                return (
                  <div key={item.id} className="flex items-center gap-4 p-6 hover:bg-gray-50/50 transition-all">
                    {image ? (
                      <Image
                        src={image.url}
                        alt={image.altText ?? item.variant.product.name}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-md object-cover border"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-md bg-gray-100 border flex items-center justify-center text-xs text-gray-400">
                        No Image
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {item.variant.product.name}
                      </p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">
                        SKU: {item.variant.sku}
                      </p>
                      {attrString && (
                        <p className="text-xs text-gray-500 mt-1">
                          {attrString}
                        </p>
                      )}
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">
                        {formatLKR(Number(item.unitPrice))}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-gray-950 mt-1">
                        {formatLKR(Number(item.totalPrice))}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
            {/* Calculations */}
            <div className="border-t bg-gray-50/50 p-6 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">{formatLKR(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-medium text-gray-900">{formatLKR(Number(order.shippingFee))}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount</span>
                  <span>-{formatLKR(Number(order.discount))}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 text-base font-bold text-gray-900">
                <span>Total</span>
                <span>{formatLKR(Number(order.total))}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-2">Order Notes (Customer)</h2>
            {order.notes ? (
              <p className="text-sm text-gray-600 bg-gray-50 rounded-md p-3 border italic">
                &ldquo;{order.notes}&rdquo;
              </p>
            ) : (
              <p className="text-sm text-gray-400 italic">No notes provided by customer.</p>
            )}
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Customer Card */}
          <div className="rounded-lg border bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" /> Customer Details
            </h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">
                {order.customer.firstName} {order.customer.lastName}
              </p>
              <div className="flex items-center gap-2 text-gray-500">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${order.customer.email}`} className="hover:underline">
                  {order.customer.email}
                </a>
              </div>
              {order.customer.phone && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Phone className="h-4 w-4" />
                  <span>{order.customer.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-lg border bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" /> Shipping Address
            </h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="font-semibold text-gray-900">{order.shippingAddress.fullName}</p>
              <p className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-gray-400" /> {order.shippingAddress.phone}
              </p>
              <div className="mt-2 text-gray-500 space-y-0.5">
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.district}
                </p>
                <p>
                  {order.shippingAddress.province}
                  {order.shippingAddress.postalCode && ` - ${order.shippingAddress.postalCode}`}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded-lg border bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-400" /> Payment Information
            </h2>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Method</span>
                <span className="font-medium text-gray-900">{order.paymentMethod || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount</span>
                <span className="font-semibold text-gray-900">{formatLKR(Number(order.total))}</span>
              </div>
              {order.payment && (
                <div className="border-t pt-2 mt-2 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Payhere Order ID</span>
                    <span className="font-mono text-gray-900">{order.payment.payhereOrderId}</span>
                  </div>
                  {order.payment.payherePaymentId && (
                    <div className="flex justify-between">
                      <span>Transaction ID</span>
                      <span className="font-mono text-gray-900">{order.payment.payherePaymentId}</span>
                    </div>
                  )}
                  {order.payment.notifyReceivedAt && (
                    <div className="flex justify-between">
                      <span>Paid On</span>
                      <span className="text-gray-900">{formatDate(order.payment.notifyReceivedAt)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Status Update Form */}
          <div className="rounded-lg border bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900 border-b pb-2">Update Order</h2>
            <form action={updateWithId} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="status" className="text-xs font-semibold text-gray-500 uppercase">
                  Order Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={order.status}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
                >
                  {Object.values(OrderStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="paymentStatus" className="text-xs font-semibold text-gray-500 uppercase">
                  Payment Status
                </label>
                <select
                  id="paymentStatus"
                  name="paymentStatus"
                  defaultValue={order.paymentStatus}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
                >
                  {Object.values(PaymentStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="notes" className="text-xs font-semibold text-gray-500 uppercase">
                  Customer Notes / Internal Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  defaultValue={order.notes ?? ""}
                  placeholder="Add details like delivery updates or customer notes..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-md bg-black px-4 py-2 text-center text-sm font-semibold text-white hover:bg-zinc-800 transition-colors"
                >
                  Save Changes
                </button>
                <Link
                  href="/admin/orders"
                  className="rounded-md border border-gray-300 px-4 py-2 text-center text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </form>

            {/* Delete form */}
            <DeleteOrderForm orderNumber={order.orderNumber} deleteAction={deleteWithId} />
          </div>
        </div>
      </div>
    </div>
  )
}
