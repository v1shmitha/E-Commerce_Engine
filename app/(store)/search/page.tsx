import { prisma } from "@/engine/lib/prisma"
import Image from "next/image"
import Link from "next/link"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams

  const products = q
    ? await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { tags: { has: q.toLowerCase() } },
            { category: { name: { contains: q, mode: "insensitive" } } },
          ],
        },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: true,
        },
        take: 24,
      })
    : []

  function formatLKR(amount: number) {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">

      {/* Search Input */}
      <form method="GET" className="mb-12">
        <div className="flex border-b border-[#0A0A0A] max-w-xl">
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search products..."
            autoFocus
            className="flex-1 py-3 text-lg bg-transparent outline-none text-[#0A0A0A] placeholder-[#8C8C8C]"
            style={{ fontFamily: "var(--font-serif)" }}
          />
          <button
            type="submit"
            className="text-[11px] tracking-[0.15em] uppercase text-[#8C8C8C] hover:text-[#0A0A0A] pb-3 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {q && (
        <div className="mb-8">
          <p className="text-sm text-[#8C8C8C]">
            {products.length === 0
              ? `No results for "${q}"`
              : `${products.length} result${products.length !== 1 ? "s" : ""} for "${q}"`}
          </p>
        </div>
      )}

      {products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => {
            const image = product.images[0]
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

      {!q && (
        <div className="py-12 text-center">
          <p className="text-[#8C8C8C] text-sm">
            Start typing to search products.
          </p>
        </div>
      )}
    </div>
  )
}