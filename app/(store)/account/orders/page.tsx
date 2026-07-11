import { createClient } from "@/engine/lib/supabase/server"
import { prisma } from "@/engine/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) redirect("/login")

  const orders = await prisma.order.findMany({
    where: { customerId: data.user.id },
    include: { items: true, payment: true },
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
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center gap-3 mb-10">
        <Link href="/account" className="text-[11px] tracking-[0.1em] uppercase text-[#8C8C8C] hover:text-[#0A0A0A]">
          Account
        </Link>
        <span className="text-[#E0E0E0]">/</span>
        <span className="text-[11px] tracking-[0.1em] uppercase text-[#0A0A0A]">
          Orders
        </span>
      </div>

      <h1
        className="text-3xl md:text-4xl text-[#0A0A0A] mb-8"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Order History
      </h1>

      {orders.length === 0 ? (
        <div className="border border-[#E0E0E0] p-16 text-center">
          <p className="text-sm text-[#8C8C8C]">No orders yet.</p>
          <Link
            href="/products"
            className="mt-6 inline-block bg-[#0A0A0A] text-white px-6 py-3 text-[11px] font-medium tracking-[0.2em] uppercase"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-[#E0E0E0] border border-[#E0E0E0]">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex items-center justify-between p-5 hover:bg-[#F2F2F2] transition-colors group"
            >
              <div>
                <p className="text-sm font-medium text-[#0A0A0A]">
                  {order.orderNumber}
                </p>
                <p className="text-xs text-[#8C8C8C] mt-1">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""} ·{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-LK", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className={`text-[10px] tracking-[0.1em] uppercase px-2 py-0.5 ${
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
                    className={`text-[10px] tracking-[0.1em] uppercase px-2 py-0.5 ${
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
              <div className="text-right">
                <p className="text-sm font-medium text-[#0A0A0A]">
                  {formatLKR(Number(order.total))}
                </p>
                <span className="text-[#8C8C8C] group-hover:text-[#0A0A0A] text-sm">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}