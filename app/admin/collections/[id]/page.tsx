import { prisma } from "@/engine/lib/prisma"
import {
  updateCollection,
  deleteCollection,
  assignProductToCollection,
  removeProductFromCollection,
} from "@/engine/api/collections"
import { DeleteCollectionForm } from "@/engine/components/collection/DeleteCollectionForm"
import { notFound } from "next/navigation"

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [collection, allProducts] = await Promise.all([
    prisma.collection.findUnique({
      where: { id },
      include: {
        products: {
          include: { product: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ])

  if (!collection) notFound()

  const updateWithId = updateCollection.bind(null, collection.id)
  const deleteWithId = deleteCollection.bind(null, collection.id)

  const assignedProductIds = new Set(
    collection.products.map((p) => p.productId)
  )

  const unassignedProducts = allProducts.filter(
    (p) => !assignedProductIds.has(p.id)
  )

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold">Edit Collection</h1>

      <form action={updateWithId} className="mt-6 space-y-5">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={collection.name}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
          <p className="text-xs text-gray-400">
            URL: /collections/{collection.slug}
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={collection.description ?? ""}
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
            defaultValue={collection.sortOrder}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={collection.isActive}
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
          <a href="/admin/collections" className="rounded-md border px-4 py-2 text-sm font-medium">Cancel</a>
        </div>
      </form>

      <div className="mt-8 border-t pt-6">
        <h2 className="text-sm font-semibold">Products in this collection</h2>

        {collection.products.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">No products assigned yet.</p>
        ) : (
          <div className="mt-3 overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <tbody>
                {collection.products.map(({ product }) => {
                  const removeAction = removeProductFromCollection.bind(
                    null,
                    collection.id,
                    product.id
                  )
                  return (
                    <tr key={product.id} className="border-b last:border-0">
                      <td className="px-3 py-2 font-medium">{product.name}</td>
                      <td className="px-3 py-2 text-right">
                        <form action={removeAction}>
                          <button
                            type="submit"
                            className="text-xs font-medium text-red-600 underline"
                          >
                            Remove
                          </button>
                        </form>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {unassignedProducts.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium">Add a product</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {unassignedProducts.map((product) => {
                const assignAction = assignProductToCollection.bind(
                  null,
                  collection.id,
                  product.id
                )
                return (
                  <form key={product.id} action={assignAction}>
                    <button
                      type="submit"
                      className="rounded-full border px-3 py-1 text-xs font-medium hover:bg-gray-50"
                    >
                      + {product.name}
                    </button>
                  </form>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <DeleteCollectionForm
        collectionName={collection.name}
        deleteAction={deleteWithId}
      />
    </div>
  )
}