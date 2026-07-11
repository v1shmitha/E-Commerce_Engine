import { createClient } from "@/engine/lib/supabase/server"
import { prisma } from "@/engine/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { AddressForm } from "@/engine/components/account/AddressForm"
import { deleteAddress, setDefaultAddress } from "@/engine/api/addresses"

export default async function AddressesPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) redirect("/login")

  const addresses = await prisma.address.findMany({
    where: { customerId: data.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  })

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center gap-3 mb-10">
        <Link href="/account" className="text-[11px] tracking-[0.1em] uppercase text-[#8C8C8C] hover:text-[#0A0A0A]">
          Account
        </Link>
        <span className="text-[#E0E0E0]">/</span>
        <span className="text-[11px] tracking-[0.1em] uppercase text-[#0A0A0A]">
          Addresses
        </span>
      </div>

      <h1
        className="text-3xl text-[#0A0A0A] mb-8"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Saved Addresses
      </h1>

      {addresses.length > 0 && (
        <div className="space-y-3 mb-10">
          {addresses.map((address) => {
            const deleteWithId = deleteAddress.bind(null, address.id)
            const setDefaultWithId = setDefaultAddress.bind(null, address.id)
            return (
              <div
                key={address.id}
                className={`border p-4 ${
                  address.isDefault
                    ? "border-[#0A0A0A]"
                    : "border-[#E0E0E0]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    {address.label && (
                      <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C] mb-1">
                        {address.label}
                        {address.isDefault && (
                          <span className="ml-2 text-[#0A0A0A]">· Default</span>
                        )}
                      </p>
                    )}
                    <p className="text-sm font-medium text-[#0A0A0A]">
                      {address.fullName}
                    </p>
                    <p className="text-sm text-[#8C8C8C] mt-0.5">
                      {address.addressLine1}
                      {address.addressLine2 && `, ${address.addressLine2}`}
                    </p>
                    <p className="text-sm text-[#8C8C8C]">
                      {address.city}, {address.district}, {address.province}
                    </p>
                    <p className="text-sm text-[#8C8C8C]">{address.phone}</p>
                  </div>
                  <div className="flex flex-col gap-2 text-right">
                    {!address.isDefault && (
                      <form action={setDefaultWithId}>
                        <button
                          type="submit"
                          className="text-[11px] tracking-[0.1em] uppercase text-[#8C8C8C] hover:text-[#0A0A0A] transition-colors"
                        >
                          Set Default
                        </button>
                      </form>
                    )}
                    <form
                      action={deleteWithId}
                      onSubmit={(e) => {
                        if (!confirm("Delete this address?")) e.preventDefault()
                      }}
                    >
                      <button
                        type="submit"
                        className="text-[11px] tracking-[0.1em] uppercase text-red-400 hover:text-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="border border-[#E0E0E0] p-6">
        <h2
          className="text-lg text-[#0A0A0A] mb-5"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Add New Address
        </h2>
        <AddressForm />
      </div>
    </div>
  )
}