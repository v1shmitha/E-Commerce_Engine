import { prisma } from "@/engine/lib/prisma"
import { createProduct } from "@/engine/api/products"

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  })

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold">Add Product</h1>

      <form action={createProduct} className="mt-6 space-y-5">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Product name
          </label>
          <input
            id="name"
            name="name"
            required
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
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="isActive" defaultChecked />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="isFeatured" />
            Featured
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Create Product
          </button>
          <a
            href="/admin/products"
            className="rounded-md border px-4 py-2 text-sm font-medium"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}