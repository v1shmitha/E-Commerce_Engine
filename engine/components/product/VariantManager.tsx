"use client";

import { useState } from "react";
import {
  createVariant,
  updateVariant,
  deleteVariant,
} from "@/engine/api/products";

type Variant = {
  id: string;
  sku: string;
  stock: number;
  price: number;
  attributes: unknown;
};

export function VariantManager({
  productId,
  variants,
}: {
  productId: string;
  variants: Variant[];
}) {
  const [showForm, setShowForm] = useState(false);

  async function handleCreate(formData: FormData) {
    await createVariant(productId, formData);
    setShowForm(false);
  }

  return (
    <div className="mt-8 border-t pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Variants</h2>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="text-sm font-medium underline"
        >
          {showForm ? "Cancel" : "+ Add Variant"}
        </button>
      </div>

      {showForm && (
        <form
          action={handleCreate}
          className="mt-4 grid grid-cols-2 gap-3 rounded-md border bg-gray-50 p-4"
        >
          <div className="space-y-1">
            <label className="text-xs font-medium">Size</label>
            <input
              name="size"
              required
              placeholder="M"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Colour</label>
            <input
              name="colour"
              required
              placeholder="Black"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Colour Hex</label>
            <input
              name="colourHex"
              placeholder="#1a1a1a"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">SKU</label>
            <input
              name="sku"
              required
              placeholder="HOD-BLK-M"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Stock</label>
            <input
              name="stock"
              type="number"
              required
              defaultValue={0}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Price (LKR)</label>
            <input
              name="price"
              type="number"
              step="0.01"
              required
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div className="col-span-2">
            <button
              type="submit"
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
            >
              Add Variant
            </button>
          </div>
        </form>
      )}

      <div className="mt-4 overflow-hidden rounded-md border">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-3 py-2 font-medium">SKU</th>
              <th className="px-3 py-2 font-medium">Size</th>
              <th className="px-3 py-2 font-medium">Colour</th>
              <th className="px-3 py-2 font-medium">Stock</th>
              <th className="px-3 py-2 font-medium">Price</th>
              <th className="px-3 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant) => {
              const attrs = variant.attributes as {
                size?: string;
                colour?: string;
                colourHex?: string;
              };

              return (
                <VariantRow
                  key={variant.id}
                  variant={variant}
                  attrs={attrs}
                  productId={productId}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VariantRow({
  variant,
  attrs,
  productId,
}: {
  variant: Variant;
  attrs: { size?: string; colour?: string; colourHex?: string };
  productId: string;
}) {
  const [editing, setEditing] = useState(false);

  const updateWithIds = updateVariant.bind(null, variant.id, productId);
  const deleteWithIds = deleteVariant.bind(null, variant.id, productId);

  if (editing) {
    return (
      <tr className="border-b">
        <td colSpan={6} className="p-3">
          <form
            action={async (formData) => {
              await updateWithIds(formData);
              setEditing(false);
            }}
            className="grid grid-cols-6 gap-2"
          >
            <input
              name="sku"
              defaultValue={variant.sku}
              className="rounded-md border px-2 py-1 text-sm"
            />
            <input
              name="size"
              defaultValue={attrs.size ?? ""}
              className="rounded-md border px-2 py-1 text-sm"
            />
            <input
              name="colour"
              defaultValue={attrs.colour ?? ""}
              className="rounded-md border px-2 py-1 text-sm"
            />
            <input
              name="stock"
              type="number"
              defaultValue={variant.stock}
              className="rounded-md border px-2 py-1 text-sm"
            />
            <input
              name="price"
              type="number"
              step="0.01"
              defaultValue={variant.price}
              className="rounded-md border px-2 py-1 text-sm"
            />
            <input
              name="colourHex"
              defaultValue={attrs.colourHex ?? ""}
              hidden
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-md bg-black px-2 py-1 text-xs font-medium text-white"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-md border px-2 py-1 text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b last:border-0">
      <td className="px-3 py-2">{variant.sku}</td>
      <td className="px-3 py-2">{attrs.size}</td>
      <td className="px-3 py-2">
        <span className="flex items-center gap-2">
          {attrs.colourHex && (
            <span
              className="h-3 w-3 rounded-full border"
              style={{ backgroundColor: attrs.colourHex }}
            />
          )}
          {attrs.colour}
        </span>
      </td>
      <td className="px-3 py-2">
        {variant.stock === 0 ? (
          <span className="text-red-600">Out of stock</span>
        ) : (
          variant.stock
        )}
      </td>
      <td className="px-3 py-2">
        {new Intl.NumberFormat("en-LK", {
          style: "currency",
          currency: "LKR",
          minimumFractionDigits: 0,
        }).format(variant.price)}
      </td>
      <td className="px-3 py-2 text-right">
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs font-medium underline"
          >
            Edit
          </button>
          <form
            action={deleteWithIds}
            onSubmit={(e) => {
              if (
                !confirm(
                  `Delete variant "${variant.sku}"? This cannot be undone.`,
                )
              ) {
                e.preventDefault();
              }
            }}
          >
            <button
              type="submit"
              className="text-xs font-medium text-red-600 underline"
            >
              Delete
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
