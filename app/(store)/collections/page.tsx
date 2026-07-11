import { prisma } from "@/engine/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export default async function CollectionsPage() {
  const collections = await prisma.collection.findMany({
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
      _count: { select: { products: true } },
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1
        className="text-3xl md:text-4xl text-[#0A0A0A] mb-10"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Collections
      </h1>
      <div className="grid md:grid-cols-2 gap-10">
        {collections.map((collection) => {
          const image = collection.products[0]?.product?.images[0]?.url ?? null;
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
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
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
                  {collection._count.products} pieces →
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
