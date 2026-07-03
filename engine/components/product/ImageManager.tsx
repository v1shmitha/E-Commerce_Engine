"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  uploadProductImage,
  deleteProductImage,
  setPrimaryImage,
} from "@/engine/api/images";

type ProductImage = {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
};

export function ImageManager({
  productId,
  images,
}: {
  productId: string;
  images: ProductImage[];
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadProductImage(productId, formData);

    if (result?.error) {
      setError(result.error);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="mt-8 border-t pt-6">
      <h2 className="text-sm font-semibold">Images</h2>

      {error && (
        <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-4 grid grid-cols-4 gap-3">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative aspect-square overflow-hidden rounded-md border"
          >
            <Image
              src={image.url}
              alt={image.altText ?? "Product image"}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
            />

            {image.isPrimary && (
              <span className="absolute left-1 top-1 rounded-full bg-black px-2 py-0.5 text-xs font-medium text-white">
                Primary
              </span>
            )}

            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              {!image.isPrimary && (
                <button
                  type="button"
                  onClick={() => setPrimaryImage(image.id, productId)}
                  className="rounded-md bg-white px-2 py-1 text-xs font-medium"
                >
                  Set Primary
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (confirm("Delete this image?")) {
                    deleteProductImage(image.id, productId);
                  }
                }}
                className="rounded-md bg-white px-2 py-1 text-xs font-medium text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        <label className="flex aspect-square cursor-pointer items-center justify-center rounded-md border-2 border-dashed text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600">
          {uploading ? "Uploading..." : "+ Add Image"}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}
