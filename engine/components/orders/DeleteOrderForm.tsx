"use client"

export function DeleteOrderForm({
  orderNumber,
  deleteAction,
}: {
  orderNumber: string
  deleteAction: () => Promise<void>
}) {
  return (
    <form
      action={deleteAction}
      onSubmit={(e) => {
        const message = `Delete order "${orderNumber}"? This cannot be undone.`
        if (!confirm(message)) {
          e.preventDefault()
        }
      }}
      className="mt-6 border-t pt-6"
    >
      <p className="text-sm text-gray-500">
        Deleting an order will remove all associated payment and item records. This action cannot be undone.
      </p>
      <button
        type="submit"
        className="mt-3 rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
      >
        Delete Order
      </button>
    </form>
  )
}
