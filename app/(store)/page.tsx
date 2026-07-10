import { prisma } from "@/engine/lib/prisma"
import Image from "next/image"
import Link from "next/link"

export default async function HomePage() {
  const [featuredProducts, collections] = await Promise.all([
    prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: true,
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.collection.findMany({
      where: { isActive: true },
      include: {
        products: {
          take: 1,
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
      },
      orderBy: { sortOrder: "asc" },
      take: 2,
    }),
  ])

  function formatLKR(amount: number) {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const heroProduct = featuredProducts[0]

  return (
    <div>

      {/* Hero */}
      <section className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-[#F2F2F2] overflow-hidden">
        {heroProduct?.images[0] ? (
          <Image
            src={heroProduct.images[0].url}
            alt={heroProduct.name}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-[#F2F2F2]" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Text — bottom left */}
        <div className="absolute bottom-10 left-8 md:bottom-16 md:left-12">
          <p className="text-[10px] md:text-xs tracking-[0.25em] uppercase text-white/70 mb-3">
            New Collection
          </p>
          <h1
            className="text-4xl md:text-7xl text-white leading-none"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            The Edit
          </h1>
          <div className="mt-6 flex items-center gap-6">
            <Link
              href="/products"
              className="bg-white text-[#0A0A0A] px-5 py-2.5 text-[11px] font-medium tracking-[0.15em] uppercase hover:bg-[#F2F2F2] transition-colors"
            >
              Shop Now
            </Link>
            <Link
              href="/collections/new-arrivals"
              className="text-white text-[11px] font-medium tracking-[0.15em] uppercase border-b border-white/50 pb-0.5 hover:border-white transition-colors"
            >
              New Arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* Category strip */}
      <section className="border-b border-[#E0E0E0]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center divide-x divide-[#E0E0E0]">
            {["T-Shirts", "Dresses", "Trousers", "Sarees", "Batik"].map((cat) => (
              <Link
                key={cat}
                href={`/categories/${cat.toLowerCase().replace(/\s+/g, "-")}`}
                className="flex-1 py-4 text-center text-[11px] font-medium tracking-[0.12em] uppercase text-[#8C8C8C] hover:text-[#0A0A0A] hover:bg-[#F2F2F2] transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="flex items-baseline justify-between mb-10">
          <h2
            className="text-3xl md:text-4xl text-[#0A0A0A]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            New Arrivals
          </h2>
          <Link
            href="/products"
            className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#8C8C8C] hover:text-[#0A0A0A] transition-colors"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map((product) => {
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
                      className="object-cover transition-transform duration-700 group-hover:scale-103"
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
      </section>

      {/* Collections */}
      <section className="mx-auto max-w-7xl px-6 pb-16 md:pb-20">
        <div className="flex items-baseline justify-between mb-10">
          <h2
            className="text-3xl md:text-4xl text-[#0A0A0A]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Collections
          </h2>
          <Link
            href="/collections"
            className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#8C8C8C] hover:text-[#0A0A0A] transition-colors"
          >
            View All →
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {collections.map((collection) => {
            const image =
              collection.products[0]?.product?.images[0]?.url ?? null
            return (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className="group relative aspect-[4/3] bg-[#F2F2F2] overflow-hidden block"
              >
                {image ? (
                  <Image
                    src={image}
                    alt={collection.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-103"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#F2F2F2]" />
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors" />
                <div className="absolute bottom-6 left-6">
                  <p
                    className="text-white text-2xl md:text-3xl"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {collection.name}
                  </p>
                  <p className="text-white/60 text-[11px] tracking-[0.15em] uppercase mt-1.5">
                    Shop Collection →
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Black banner */}
      <section className="bg-[#0A0A0A] px-6 py-20 text-center">
        <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-5">
          Complimentary Delivery
        </p>
        <h2
          className="text-4xl md:text-5xl text-white"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Free shipping on orders
          <br />
          above LKR 5,000
        </h2>
        <Link
          href="/products"
          className="mt-10 inline-block border border-white/20 text-white px-8 py-3 text-[11px] font-medium tracking-[0.2em] uppercase hover:bg-white hover:text-[#0A0A0A] transition-colors"
        >
          Shop the Collection
        </Link>
      </section>

    </div>
  )
}