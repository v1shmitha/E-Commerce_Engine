import { prisma } from "@/engine/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      addresses: true,
      orders: {
        include: {
          items: {
            include: {
              variant: true,
            },
          },
          payment: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!customer) notFound()

  function formatLKR(amount: number) {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const totalSpend = customer.orders.reduce(
    (sum, order) => sum + Number(order.total),
    0
  )

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/customers"
          className="text-sm text-gray-500 underline"
        >
          Customers
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium">
          {customer.firstName} {customer.lastName}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-gray-500">Total Orders</p>
          <p className="mt-1 text-2xl font-semibold">{customer.orders.length}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-gray-500">Total Spend</p>
          <p className="mt-1 text-2xl font-semibold">
            {totalSpend > 0 ? formatLKR(totalSpend) : "LKR 0"}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-gray-500">Member Since</p>
          <p className="mt-1 text-2xl font-semibold">
            {new Date(customer.createdAt).toLocaleDateString("en-LK", {
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border bg-white p-5">
        <h2 className="text-sm font-semibold">Profile</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500">Full name</p>
            <p className="font-medium">
              {customer.firstName} {customer.lastName}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-medium">{customer.email}</p>
          </div>
          <div>
            <p className="text-gray-500">Phone</p>
            <p className="font-medium">{customer.phone ?? "Not provided"}</p>
          </div>
        </div>
      </div>

      {customer.addresses.length > 0 && (
        <div className="mt-4 rounded-lg border bg-white p-5">
          <h2 className="text-sm font-semibold">Saved Addresses</h2>
          <div className="mt-3 space-y-3">
            {customer.addresses.map((address) => (
              <div key={address.id} className="text-sm">
                <p className="font-medium">
                  {address.label ?? "Address"}
                  {address.isDefault && (
                    <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      Default
                    </span>
                  )}
                </p>
                <p className="text-gray-600">
                  {address.addressLine1}
                  {address.addressLine2 && `, ${address.addressLine2}`}
                </p>
                <p className="text-gray-600">
                  {address.city}, {address.district}, {address.province}
                </p>
                <p className="text-gray-600">{address.phone}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 rounded-lg border bg-white p-5">
        <h2 className="text-sm font-semibold">Order History</h2>

        {customer.orders.length === 0 ? (
          <p className="mt-3 text-sm text-gray-400">No orders yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {customer.orders.map((order) => (
              <div key={order.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {order.orderNumber}
                  </span>
                  <span className="text-sm font-semibold">
                    {formatLKR(Number(order.total))}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      order.status === "DELIVERED"
                        ? "bg-green-100 text-green-700"
                        : order.status === "CANCELLED"
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      order.paymentStatus === "COMPLETED"
                        ? "bg-green-100 text-green-700"
                        : order.paymentStatus === "FAILED"
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString("en-LK", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="mt-2 space-y-1">
                  {order.items.map((item) => {
                    const attrs = item.variant.attributes as {
                      size?: string
                      colour?: string
                    }
                    return (
                      <p key={item.id} className="text-xs text-gray-500">
                        {item.quantity}x {attrs.size} / {attrs.colour} —{" "}
                        {formatLKR(Number(item.unitPrice))}
                      </p>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}