import { createClient } from "@/engine/lib/supabase/server";
import { prisma } from "@/engine/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/engine/components/account/SignOutButton";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  const [customer, orderCount] = await Promise.all([
    prisma.customer.findUnique({
      where: { id: data.user.id },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { items: true },
        },
        _count: { select: { wishlistItems: true } },
      },
    }),
    prisma.order.count({
      where: {
        customerId: data.user.id,
        NOT: {
          AND: [{ status: "PENDING" }, { paymentStatus: "PENDING" }],
        },
      },
    }),
  ]);

  if (!customer) redirect("/login");

  function formatLKR(amount: number) {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1
            className="text-3xl md:text-4xl text-[#0A0A0A]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            My Account
          </h1>
          <p className="mt-1 text-sm text-[#8C8C8C]">
            {customer.firstName} {customer.lastName} · {customer.email}
          </p>
        </div>
        <SignOutButton />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="border border-[#E0E0E0] p-5">
          <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C]">
            Orders
          </p>
          <p
            className="mt-2 text-2xl text-[#0A0A0A]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {orderCount}
          </p>
        </div>
        <div className="border border-[#E0E0E0] p-5">
          <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C]">
            Wishlist
          </p>
          <p
            className="mt-2 text-2xl text-[#0A0A0A]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {customer._count.wishlistItems}
          </p>
        </div>
        <div className="border border-[#E0E0E0] p-5">
          <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C]">
            Member Since
          </p>
          <p
            className="mt-2 text-lg text-[#0A0A0A]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {new Date(customer.createdAt).toLocaleDateString("en-LK", {
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3 mb-10">
        <Link
          href="/account/orders"
          className="flex items-center justify-between border border-[#E0E0E0] p-4 hover:border-[#0A0A0A] transition-colors group"
        >
          <span className="text-sm font-medium text-[#0A0A0A]">
            Order History
          </span>
          <span className="text-[#8C8C8C] group-hover:text-[#0A0A0A]">→</span>
        </Link>
        <Link
          href="/account/wishlist"
          className="flex items-center justify-between border border-[#E0E0E0] p-4 hover:border-[#0A0A0A] transition-colors group"
        >
          <span className="text-sm font-medium text-[#0A0A0A]">Wishlist</span>
          <span className="text-[#8C8C8C] group-hover:text-[#0A0A0A]">→</span>
        </Link>
        <Link
          href="/account/addresses"
          className="flex items-center justify-between border border-[#E0E0E0] p-4 hover:border-[#0A0A0A] transition-colors group"
        >
          <span className="text-sm font-medium text-[#0A0A0A]">
            Saved Addresses
          </span>
          <span className="text-[#8C8C8C] group-hover:text-[#0A0A0A]">→</span>
        </Link>
        <Link
          href="/account/profile"
          className="flex items-center justify-between border border-[#E0E0E0] p-4 hover:border-[#0A0A0A] transition-colors group"
        >
          <span className="text-sm font-medium text-[#0A0A0A]">
            Profile Settings
          </span>
          <span className="text-[#8C8C8C] group-hover:text-[#0A0A0A]">→</span>
        </Link>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-baseline justify-between mb-5">
          <h2
            className="text-xl text-[#0A0A0A]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Recent Orders
          </h2>
          <Link
            href="/account/orders"
            className="text-[11px] tracking-[0.15em] uppercase text-[#8C8C8C] hover:text-[#0A0A0A] border-b border-[#8C8C8C]"
          >
            View All
          </Link>
        </div>

        {customer.orders.length === 0 ? (
          <div className="border border-[#E0E0E0] p-10 text-center">
            <p className="text-sm text-[#8C8C8C]">No orders yet.</p>
            <Link
              href="/products"
              className="mt-4 inline-block text-[11px] tracking-[0.15em] uppercase text-[#0A0A0A] border-b border-[#0A0A0A]"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#E0E0E0] border border-[#E0E0E0]">
            {customer.orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between p-4 hover:bg-[#F2F2F2] transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-[#0A0A0A]">
                    {order.orderNumber}
                  </p>
                  <p className="text-xs text-[#8C8C8C] mt-0.5">
                    {order.items.length} item
                    {order.items.length !== 1 ? "s" : ""} ·{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-LK", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#0A0A0A]">
                    {formatLKR(Number(order.total))}
                  </p>
                  <span
                    className={`text-[10px] tracking-[0.1em] uppercase ${
                      order.status === "DELIVERED"
                        ? "text-green-600"
                        : order.status === "CANCELLED"
                          ? "text-red-500"
                          : order.status === "SHIPPED"
                            ? "text-blue-600"
                            : "text-[#8C8C8C]"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
