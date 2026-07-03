"use client"

export function DeleteCategoryForm({
  categoryName,
  productCount,
  deleteAction,
}: {
  categoryName: string
  productCount: number
  deleteAction: () => Promise<void>
}) {
  return (
    <form
      action={deleteAction}
      onSubmit={(e) => {
        const message =
          productCount > 0
            ? `"${categoryName}" has ${productCount} product(s) assigned. Deleting it may break those products. Continue?`
            : `Delete "${categoryName}"? This cannot be undone.`

        if (!confirm(message)) {
          e.preventDefault()
        }
      }}
      className="mt-6 border-t pt-6"
    >
      <p className="text-sm text-gray-500">
        Deleting a category cannot be undone.
      </p>
      <button
        type="submit"
        className="mt-3 rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Delete Category
      </button>
    </form>
  )
}