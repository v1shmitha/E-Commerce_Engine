import { prisma } from "@/engine/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/engine/components/product/AddToCartButton";
import { getWishlistIds } from "@/engine/api/wishlist";
import { WishlistButton } from "@/engine/components/product/WishlistButton";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [product, wishlistIds] = await Promise.all([
    prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: true,
        variants: { where: { isActive: true }, orderBy: { sku: "asc" } },
      },
    }),
    getWishlistIds(),
  ]);

  if (!product) notFound();

  const metadata = product.metadata as Record<string, string>;

  const sizes = [
    ...new Set(
      product.variants.map(
        (v) => (v.attributes as Record<string, string>).size,
      ),
    ),
  ].filter(Boolean);

  const colours = [
    ...new Set(
      product.variants.map(
        (v) => (v.attributes as Record<string, string>).colour,
      ),
    ),
  ].filter(Boolean);

  const primaryImage =
    product.images.find((i) => i.isPrimary) ?? product.images[0];

  function formatLKR(amount: number) {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  const serializedVariants = product.variants.map((v) => ({
    ...v,
    price: Number(v.price),
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase text-[#8C8C8C] mb-8">
        <Link href="/" className="hover:text-[#0A0A0A]">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-[#0A0A0A]">
          Products
        </Link>
        <span>/</span>
        <span className="text-[#0A0A0A]">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-[3/4] bg-[#F2F2F2] overflow-hidden">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.altText ?? product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-[#F2F2F2]" />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square bg-[#F2F2F2] overflow-hidden"
                >
                  <Image
                    src={img.url}
                    alt={img.altText ?? product.name}
                    fill
                    sizes="25vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="md:sticky md:top-24 self-start">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#8C8C8C] mb-2">
            {product.category.name}
          </p>
          <div className="flex items-start justify-between gap-4">
            <h1
              className="text-3xl md:text-4xl text-[#0A0A0A] leading-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {product.name}
            </h1>
            <div className="relative mt-1">
              <WishlistButton
                productId={product.id}
                initialWishlisted={wishlistIds.includes(product.id)}
              />
            </div>
          </div>
          <p className="mt-3 text-lg text-[#0A0A0A]">
            {formatLKR(Number(product.basePrice))}
          </p>

          {product.description && (
            <p className="mt-5 text-sm text-[#8C8C8C] leading-relaxed">
              {product.description}
            </p>
          )}

          <div className="mt-8">
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                basePrice: Number(product.basePrice),
                image: primaryImage?.url ?? null,
              }}
              variants={serializedVariants}
              sizes={sizes}
              colours={colours}
            />
          </div>

          {/* Extra fields from metadata */}
          {(metadata.material || metadata.careInstructions) && (
            <div className="mt-8 border-t border-[#E0E0E0] pt-6 space-y-3">
              {metadata.material && (
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C]">
                    Material
                  </p>
                  <p className="text-sm text-[#0A0A0A] mt-1">
                    {metadata.material}
                  </p>
                </div>
              )}
              {metadata.careInstructions && (
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C]">
                    Care
                  </p>
                  <p className="text-sm text-[#0A0A0A] mt-1">
                    {metadata.careInstructions}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
