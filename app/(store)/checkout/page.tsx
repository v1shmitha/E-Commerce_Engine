import { createClient } from "@/engine/lib/supabase/server"
import { prisma } from "@/engine/lib/prisma"
import { redirect } from "next/navigation"
import Script from "next/script"
import CheckoutClient from "@/engine/components/checkout/CheckoutClient"

export default async function CheckoutPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) redirect("/login")

  const [customer, addresses] = await Promise.all([
    prisma.customer.findUnique({
      where: { id: data.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    }),
    prisma.address.findMany({
      where: { customerId: data.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
  ])

  if (!customer) redirect("/login")

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      {/* PayHere SDK is only needed on checkout — loaded here (not site-wide)
          to keep the payment script off every storefront page for better CWV. */}
      <Script
        src="https://www.payhere.lk/lib/payhere.js"
        strategy="afterInteractive"
      />
      <h1
        className="text-3xl md:text-4xl text-[#0A0A0A] mb-10"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Checkout
      </h1>
      <CheckoutClient
        customer={customer}
        savedAddresses={addresses.map((a) => ({
          ...a,
          createdAt: a.createdAt.toISOString(),
          updatedAt: a.updatedAt.toISOString(),
        }))}
      />
    </div>
  )
}