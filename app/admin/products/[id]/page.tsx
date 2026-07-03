import { prisma } from "@/engine/lib/prisma";
import { updateProduct, deleteProduct } from "@/engine/api/products";
import { notFound } from "next/navigation";
import { VariantManager } from "@/engine/components/product/VariantManager";
import { DeleteProductForm } from "@/engine/components/product/DeleteProductForm";
import { ImageManager } from "@/engine/components/product/ImageManager";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        variants: { orderBy: { sku: "asc" } },
        images: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  if (!product) {
    notFound();
  }

  const serializedVariants = product.variants.map((v) => ({
    ...v,
    price: Number(v.price),
  }));

  const metadata = (product.metadata as Record<string, string>) ?? {};
  const updateProductWithId = updateProduct.bind(null, product.id);
  const deleteProductWithId = deleteProduct.bind(null, product.id);

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold">Edit Product</h1>

      <form action={updateProductWithId} className="mt-6 space-y-5">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Product name
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={product.name}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={product.description ?? ""}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="categoryId" className="text-sm font-medium">
              Category
            </label>
            <select
              id="categoryId"
              name="categoryId"
              required
              defaultValue={product.categoryId}
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="basePrice" className="text-sm font-medium">
              Base price (LKR)
            </label>
            <input
              id="basePrice"
              name="basePrice"
              type="number"
              step="0.01"
              required
              defaultValue={Number(product.basePrice)}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="material" className="text-sm font-medium">
              Material
            </label>
            <input
              id="material"
              name="material"
              defaultValue={metadata.material ?? ""}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="careInstructions" className="text-sm font-medium">
              Care instructions
            </label>
            <input
              id="careInstructions"
              name="careInstructions"
              defaultValue={metadata.careInstructions ?? ""}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={product.isActive}
            />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={product.isFeatured}
            />
            Featured
          </label>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
            >
              Save Changes
            </button>
            <a
              href="/admin/products"
              className="rounded-md border px-4 py-2 text-sm font-medium"
            >
              Cancel
            </a>
          </div>
        </div>
      </form>

      <DeleteProductForm
        productName={product.name}
        deleteAction={deleteProductWithId}
      />
      <ImageManager productId={product.id} images={product.images} />
      <VariantManager productId={product.id} variants={serializedVariants} />
    </div>
  );
}
