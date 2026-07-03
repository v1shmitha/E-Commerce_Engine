"use client"

export function DeleteProductForm({
  productName,
  deleteAction,
}: {
  productName: string
  deleteAction: () => Promise<void>
}) {
  return (
    <form
      action={deleteAction}
      onSubmit={(e) => {
        if (
          !confirm(
            `Delete "${productName}"? This will also remove its variants and images. This cannot be undone.`
          )
        ) {
          e.preventDefault()
        }
      }}
      className="mt-6 border-t pt-6"
    >
      <p className="text-sm text-gray-500">
        Deleting a product permanently removes it along with its variants and images.
      </p>
      <button
        type="submit"
        className="mt-3 rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Delete Product
      </button>
    </form>
  )
}