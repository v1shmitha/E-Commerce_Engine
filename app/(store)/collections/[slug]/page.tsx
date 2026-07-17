import { cache } from "react"
import type { Metadata } from "next"
import { prisma } from "@/engine/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { absoluteUrl, truncate, SITE_NAME } from "@/engine/lib/seo"

// Memoised so generateMetadata and the page component share one query per request.
const getCollection = cache(async (slug: string) =>
  prisma.collection.findUnique({
    where: { slug },
    include: {
      products: {
        include: {
          product: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
              category: true,
              variants: { where: { isActive: true } },
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  }),
)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const collection = await getCollection(slug)

  if (!collection) {
    return { title: "Collection not found" }
  }

  const description = collection.description
    ? truncate(collection.description)
    : `Explore the ${collection.name} collection at ${SITE_NAME}.`
  const url = absoluteUrl(`/collections/${collection.slug}`)
  const image = collection.products.find((p) => p.product.images[0])?.product
    .images[0]

  return {
    title: collection.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: collection.name,
      description,
      url,
      images: image ? [{ url: image.url, alt: collection.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: collection.name,
      description,
      images: image ? [image.url] : undefined,
    },
  }
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const collection = await getCollection(slug)

  if (!collection) notFound()

  function formatLKR(amount: number) {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <nav className="flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase text-[#8C8C8C] mb-8">
        <Link href="/" className="hover:text-[#0A0A0A]">Home</Link>
        <span>/</span>
        <Link href="/collections" className="hover:text-[#0A0A0A]">Collections</Link>
        <span>/</span>
        <span className="text-[#0A0A0A]">{collection.name}</span>
      </nav>

      <div className="flex items-baseline justify-between mb-10">
        <h1
          className="text-3xl md:text-4xl text-[#0A0A0A]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {collection.name}
        </h1>
        <p className="text-sm text-[#8C8C8C]">
          {collection.products.length} items
        </p>
      </div>

      {collection.description && (
        <p className="text-sm text-[#8C8C8C] mb-10 max-w-xl">
          {collection.description}
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {collection.products.map(({ product }) => {
          const image = product.images[0]
          const totalStock = product.variants.reduce(
            (sum, v) => sum + v.stock, 0
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
    </div>
  )
}