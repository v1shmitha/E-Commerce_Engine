import { prisma } from "@/engine/lib/prisma"
import Link from "next/link"
import { OrderStatus, PaymentStatus } from "@prisma/client"

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

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams

  const activeStatus =
    status && Object.values(OrderStatus).includes(status as OrderStatus)
      ? (status as OrderStatus)
      : undefined

  const orders = await prisma.order.findMany({
    where: activeStatus ? { status: activeStatus } : {},
    include: {
      customer: true,
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  // Get status counts for displaying tab badges
  const counts = await prisma.order.groupBy({
    by: ["status"],
    _count: true,
  })

  const countMap = counts.reduce((acc, curr) => {
    acc[curr.status] = curr._count
    return acc
  }, {} as Record<OrderStatus, number>)

  const totalCount = Object.values(countMap).reduce((a, b) => a + b, 0)

  const tabs = [
    { label: "All", href: "/admin/orders", count: totalCount, active: !activeStatus },
    ...Object.values(OrderStatus).map((s) => ({
      label: s.charAt(0) + s.slice(1).toLowerCase(),
      href: `/admin/orders?status=${s}`,
      count: countMap[s] || 0,
      active: activeStatus === s,
    })),
  ]

  const getOrderStatusBadge = (s: OrderStatus) => {
    switch (s) {
      case OrderStatus.PENDING:
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case OrderStatus.PROCESSING:
        return "bg-blue-50 text-blue-700 border-blue-200"
      case OrderStatus.SHIPPED:
        return "bg-purple-50 text-purple-700 border-purple-200"
      case OrderStatus.DELIVERED:
        return "bg-green-50 text-green-700 border-green-200"
      case OrderStatus.CANCELLED:
      case OrderStatus.REFUNDED:
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getPaymentStatusBadge = (s: PaymentStatus) => {
    switch (s) {
      case PaymentStatus.COMPLETED:
        return "bg-green-100 text-green-800"
      case PaymentStatus.PENDING:
        return "bg-yellow-100 text-yellow-800"
      case PaymentStatus.FAILED:
      case PaymentStatus.CANCELLED:
      case PaymentStatus.CHARGEDBACK:
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500">
          Showing {orders.length} order{orders.length === 1 ? "" : "s"}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-1">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-all -mb-[9px] ${
              tab.active
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-2xs font-semibold ${
                tab.active ? "bg-black text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {tab.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-gray-900">No orders found</p>
            <p className="mt-1 text-sm text-gray-500">
              There are no orders with the status &ldquo;{activeStatus ?? "All"}&rdquo;.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th className="px-6 py-3 font-semibold">Order</th>
                  <th className="px-6 py-3 font-semibold">Customer</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Items</th>
                  <th className="px-6 py-3 font-semibold">Total</th>
                  <th className="px-6 py-3 font-semibold">Order Status</th>
                  <th className="px-6 py-3 font-semibold">Payment Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white text-gray-900">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-950">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order.customer.firstName} {order.customer.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{order.customer.email}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order._count.items}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatLKR(Number(order.total))}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getOrderStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getPaymentStatusBadge(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-black hover:underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
