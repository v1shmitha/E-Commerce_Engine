import { prisma } from "@/engine/lib/prisma"
import { createClient } from "@/engine/lib/supabase/server"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { WishlistButton } from "@/engine/components/product/WishlistButton"

export default async function WishlistPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) redirect("/login")

  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { customerId: data.user.id },
    include: {
      product: {
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: true,
          variants: { where: { isActive: true } },
        },
      },
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
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1
        className="text-3xl md:text-4xl text-[#0A0A0A] mb-10"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Wishlist
      </h1>

      {wishlistItems.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-[#8C8C8C] text-sm">Your wishlist is empty.</p>
          <Link
            href="/products"
            className="mt-6 inline-block bg-[#0A0A0A] text-white px-6 py-3 text-[11px] font-medium tracking-[0.2em] uppercase hover:bg-[#2a2a2a] transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {wishlistItems.map(({ product }) => {
            const image = product.images[0]
            const totalStock = product.variants.reduce(
              (sum, v) => sum + v.stock,
              0
            )
            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group"
              >
                <div className="relative aspect-[3/4] bg-[#F2F2F2] overflow-hidden">
                  {image ? (
                    <Image
                      src={image.url}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#F2F2F2]" />
                  )}
                  {totalStock === 0 && (
                    <div className="absolute top-3 left-3 bg-white px-2 py-1 text-[10px] tracking-[0.1em] uppercase text-[#8C8C8C]">
                      Sold Out
                    </div>
                  )}
                  <WishlistButton
                    productId={product.id}
                    initialWishlisted={true}
                  />
                </div>
                <div className="mt-3 space-y-0.5">
                  <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C]">
                    {product.category.name}
                  </p>
                  <p className="text-sm text-[#0A0A0A] group-hover:text-[#8C8C8C] transition-colors">
                    {product.name}
                  </p>
                  <p className="text-sm text-[#8C8C8C]">
                    {formatLKR(Number(product.basePrice))}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}