import { prisma } from "@/engine/lib/prisma"
import Link from "next/link"

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams

  const customers = await prisma.customer.findMany({
    where: {
      role: "CUSTOMER",
      ...(q && {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
        ],
      }),
    },
    include: {
      _count: { select: { orders: true } },
      orders: { select: { total: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  function formatLKR(amount: number) {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">Customers</h1>

      <form method="GET" className="mt-4">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name or email..."
          className="w-full max-w-sm rounded-md border px-3 py-2 text-sm"
        />
      </form>

      <div className="mt-4 overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Total Spend</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  {q ? `No customers found for "${q}"` : "No customers yet."}
                </td>
              </tr>
            ) : (
              customers.map((customer) => {
                const totalSpend = customer.orders.reduce(
                  (sum, order) => sum + Number(order.total),
                  0
                )
                return (
                  <tr key={customer.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">
                      {customer.firstName} {customer.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {customer.email}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {customer._count.orders}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {totalSpend > 0 ? formatLKR(totalSpend) : "No orders"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(customer.createdAt).toLocaleDateString(
                        "en-LK",
                        { year: "numeric", month: "short", day: "numeric" }
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="text-sm font-medium underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        Showing registered customers only. Admin accounts are excluded.
      </p>
    </div>
  )
}