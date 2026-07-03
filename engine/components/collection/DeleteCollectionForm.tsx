"use client"

export function DeleteCollectionForm({
  collectionName,
  deleteAction,
}: {
  collectionName: string
  deleteAction: () => Promise<void>
}) {
  return (
    <form
      action={deleteAction}
      onSubmit={(e) => {
        if (!confirm(`Delete "${collectionName}"? This cannot be undone.`)) {
          e.preventDefault()
        }
      }}
      className="mt-6 border-t pt-6"
    >
      <p className="text-sm text-gray-500">
        Deleting a collection removes it and all product assignments. Products themselves are not deleted.
      </p>
      <button
        type="submit"
        className="mt-3 rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Delete Collection
      </button>
    </form>
  )
}