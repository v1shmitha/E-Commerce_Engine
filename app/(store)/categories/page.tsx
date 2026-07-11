import { prisma } from "@/engine/lib/prisma"
import Link from "next/link"

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  })

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1
        className="text-3xl md:text-4xl text-[#0A0A0A] mb-10"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Categories
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-[#E0E0E0]">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="group bg-white p-8 hover:bg-[#F2F2F2] transition-colors"
          >
            <p
              className="text-2xl text-[#0A0A0A] group-hover:text-[#8C8C8C] transition-colors"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {category.name}
            </p>
            <p className="mt-2 text-[11px] tracking-[0.15em] uppercase text-[#8C8C8C]">
              {category._count.products} items →
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}