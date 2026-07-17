import { getWishlistIds } from "@/engine/api/wishlist";
import { WishlistButton } from "@/engine/components/product/WishlistButton";
import { prisma } from "@/engine/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { absoluteUrl, SITE_NAME } from "@/engine/lib/seo";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}): Promise<Metadata> {
  const { category: categorySlug } = await searchParams;

  const category = categorySlug
    ? await prisma.category.findUnique({ where: { slug: categorySlug } })
    : null;

  if (category) {
    const description =
      category.description ??
      `Shop ${category.name} at ${SITE_NAME}. Browse the latest styles and sizes.`;
    return {
      title: category.name,
      description,
      alternates: {
        canonical: absoluteUrl(`/products?category=${category.slug}`),
      },
      openGraph: {
        title: `${category.name} | ${SITE_NAME}`,
        description,
        url: absoluteUrl(`/products?category=${category.slug}`),
      },
    };
  }

  return {
    title: "All Products",
    description: `Browse every product available at ${SITE_NAME}.`,
    alternates: { canonical: absoluteUrl("/products") },
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    size?: string;
    colour?: string;
    sort?: string;
  }>;
}) {
  const { category, size, colour, sort } = await searchParams;

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(category && { category: { slug: category } }),
      ...(size && {
        variants: {
          some: {
            isActive: true,
            attributes: { path: ["size"], equals: size },
          },
        },
      }),
      ...(colour && {
        variants: {
          some: {
            isActive: true,
            attributes: { path: ["colour"], equals: colour },
          },
        },
      }),
    },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: true,
      variants: { where: { isActive: true } },
    },
    orderBy:
      sort === "price-asc"
        ? { basePrice: "asc" }
        : sort === "price-desc"
          ? { basePrice: "desc" }
          : { createdAt: "desc" },
  });

  const [categories, wishlistIds] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    getWishlistIds(),
  ]);

  const allSizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const allColours = [
    "Black",
    "White",
    "Navy",
    "Khaki",
    "Blue Batik",
    "Floral Pink",
    "Gold",
    "Maroon",
  ];

  function formatLKR(amount: number) {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex items-baseline justify-between mb-10">
        <h1
          className="text-3xl md:text-4xl text-[#0A0A0A]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          All Products
        </h1>
        <p className="text-sm text-[#8C8C8C]">{products.length} items</p>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Filters */}
        <aside className="w-full md:w-48 shrink-0">
          <form method="GET">
            <div className="space-y-8">
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#8C8C8C] mb-3">
                  Sort
                </p>
                <div className="space-y-2">
                  {[
                    { label: "Newest", value: "" },
                    { label: "Price: Low to High", value: "price-asc" },
                    { label: "Price: High to Low", value: "price-desc" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="sort"
                        value={option.value}
                        defaultChecked={
                          sort === option.value ||
                          (!sort && option.value === "")
                        }
                        className="accent-[#0A0A0A]"
                      />
                      <span className="text-xs text-[#0A0A0A]">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#8C8C8C] mb-3">
                  Category
                </p>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat.slug}
                        defaultChecked={category === cat.slug}
                        className="accent-[#0A0A0A]"
                      />
                      <span className="text-xs text-[#0A0A0A]">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#8C8C8C] mb-3">
                  Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map((s) => (
                    <label key={s} className="cursor-pointer">
                      <input
                        type="radio"
                        name="size"
                        value={s}
                        defaultChecked={size === s}
                        className="sr-only"
                      />
                      <span
                        className={`inline-flex items-center justify-center w-9 h-9 text-xs border transition-colors ${
                          size === s
                            ? "bg-[#0A0A0A] text-white border-[#0A0A0A]"
                            : "border-[#E0E0E0] text-[#0A0A0A] hover:border-[#0A0A0A]"
                        }`}
                      >
                        {s}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#8C8C8C] mb-3">
                  Colour
                </p>
                <div className="space-y-2">
                  {allColours.map((c) => (
                    <label
                      key={c}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="colour"
                        value={c}
                        defaultChecked={colour === c}
                        className="accent-[#0A0A0A]"
                      />
                      <span className="text-xs text-[#0A0A0A]">{c}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="submit"
                  className="w-full bg-[#0A0A0A] text-white py-2.5 text-[11px] font-medium tracking-[0.15em] uppercase hover:bg-[#2a2a2a] transition-colors"
                >
                  Apply
                </button>
                {(category || size || colour || sort) && (
                  <a
                    href="/products"
                    className="block w-full text-center border border-[#E0E0E0] py-2.5 text-[11px] font-medium tracking-[0.15em] uppercase text-[#8C8C8C] hover:text-[#0A0A0A] hover:border-[#0A0A0A] transition-colors"
                  >
                    Clear
                  </a>
                )}
              </div>
            </div>
          </form>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-[#8C8C8C] text-sm">No products found.</p>
              <a
                href="/products"
                className="mt-4 inline-block text-[11px] tracking-[0.15em] uppercase text-[#0A0A0A] border-b border-[#0A0A0A]"
              >
                Clear filters
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {products.map((product) => {
                const image = product.images[0];
                const totalStock = product.variants.reduce(
                  (sum, v) => sum + v.stock,
                  0,
                );
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
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[#F2F2F2]" />
                      )}
                      {totalStock === 0 && (
                        <div className="absolute top-3 left-3 bg-white px-12 py-1 text-[10px] tracking-[0.1em] uppercase text-[#8C8C8C]">
                          Sold Out
                        </div>
                      )}
                      <div className="absolute top-3 right-3 z-10">
                        <WishlistButton
                          productId={product.id}
                          initialWishlisted={wishlistIds.includes(product.id)}
                        />
                      </div>
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
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
