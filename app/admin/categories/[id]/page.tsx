import { prisma } from "@/engine/lib/prisma"
import { updateCategory, deleteCategory } from "@/engine/api/categories"
import { DeleteCategoryForm } from "@/engine/components/category/DeleteCategoryForm"
import { notFound } from "next/navigation"

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  })

  if (!category) {
    notFound()
  }

  const updateWithId = updateCategory.bind(null, category.id)
  const deleteWithId = deleteCategory.bind(null, category.id)

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold">Edit Category</h1>

      <form action={updateWithId} className="mt-6 space-y-5">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={category.name}
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
            rows={3}
            defaultValue={category.description ?? ""}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="sortOrder" className="text-sm font-medium">
            Sort order
          </label>
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            defaultValue={category.sortOrder}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={category.isActive}
          />
          Active
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Save Changes
          </button>
          <a href="/admin/categories" className="rounded-md border px-4 py-2 text-sm font-medium">Cancel</a>
        </div>
      </form>

      <DeleteCategoryForm
        categoryName={category.name}
        productCount={category._count.products}
        deleteAction={deleteWithId}
      />
    </div>
  )
}