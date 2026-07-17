import { createClient } from "@/engine/lib/supabase/server";
import { prisma } from "@/engine/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ResumeOrderButton } from "@/engine/components/account/ResumeOrderButton";
import { CancelOrderButton } from "@/engine/components/account/CancelOrderButton";

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: {
      customerId: data.user.id,
    },
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
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  function formatLKR(amount: number) {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center gap-3 mb-10">
        <Link
          href="/account"
          className="text-[11px] tracking-[0.1em] uppercase text-[#8C8C8C] hover:text-[#0A0A0A]"
        >
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
        <div className="space-y-3">
          {orders.map((order) => {
            const isPending =
              order.status === "PENDING" && order.paymentStatus === "PENDING";

            const isFailed = order.paymentStatus === "FAILED";

            return (
              <div
                key={order.id}
                className={`border p-5 ${
                  isPending || isFailed
                    ? "border-[#E0E0E0] bg-[#FAFAFA]"
                    : "border-[#E0E0E0]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#0A0A0A]">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-[#8C8C8C] mt-1">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""} ·{" "}
                      {new Date(order.createdAt).toLocaleDateString("en-LK", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <div className="mt-2">
                      <span
                        className={`text-[10px] tracking-[0.1em] uppercase px-2 py-0.5 ${
                          order.status === "DELIVERED"
                            ? "bg-green-50 text-green-600"
                            : order.status === "CANCELLED"
                              ? "bg-red-50 text-red-500"
                              : order.status === "SHIPPED"
                                ? "bg-blue-50 text-blue-600"
                                : order.status === "PROCESSING"
                                  ? "bg-blue-50 text-blue-600"
                                  : isPending
                                    ? "bg-yellow-50 text-yellow-600"
                                    : "bg-[#F2F2F2] text-[#8C8C8C]"
                        }`}
                      >
                        {order.status === "CANCELLED"
                          ? "Cancelled"
                          : order.status === "PROCESSING"
                            ? "Processing"
                            : isPending
                              ? "Awaiting Payment"
                              : order.status}
                      </span>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <p className="text-sm font-medium text-[#0A0A0A]">
                      {formatLKR(Number(order.total))}
                    </p>

                    {order.status === "CANCELLED" ? (
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="text-[11px] tracking-[0.1em] uppercase text-[#8C8C8C] hover:text-[#0A0A0A] border-b border-[#8C8C8C]"
                      >
                        View Details
                      </Link>
                    ) : isPending || isFailed ? (
                      <div className="flex flex-col items-end gap-2">
                        <ResumeOrderButton
                          items={order.items.map((item) => ({
                            variantId: item.variantId,
                            productId: item.variant.product.id,
                            productName: item.variant.product.name,
                            sku: item.variant.sku,
                            size:
                              (
                                item.variant.attributes as Record<
                                  string,
                                  string
                                >
                              ).size ?? "",
                            colour:
                              (
                                item.variant.attributes as Record<
                                  string,
                                  string
                                >
                              ).colour ?? "",
                            price: Number(item.unitPrice),
                            quantity: item.quantity,
                            imageUrl:
                              item.variant.product.images[0]?.url ?? null,
                          }))}
                        />
                        <CancelOrderButton orderId={order.id} />
                      </div>
                    ) : (
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="text-[11px] tracking-[0.1em] uppercase text-[#8C8C8C] hover:text-[#0A0A0A] border-b border-[#8C8C8C]"
                      >
                        View Details
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
