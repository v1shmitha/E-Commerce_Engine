// config/storeTypeConfig.ts

export const StoreType = {
  CLOTHING: "CLOTHING",
  ELECTRONICS: "ELECTRONICS",
} as const

export type StoreType = (typeof StoreType)[keyof typeof StoreType]

// ─── Shared shape every store type config must follow ──────────

export interface StoreTypeDefaults {
  productFields: {
    hasVariants: boolean
    variantAxes: readonly string[]
    extraFields: readonly string[]
    hasGender: boolean
  }
  filters: readonly string[]
  layout: {
    productCard: "fashion" | "tech" | "minimal"
    listingGrid: "3-col" | "4-col"
    homepage: "hero-collections" | "hero-deals"
  }
}

// ─── The lookup map ─────────────────────────────────────────────

export const storeTypeConfig: Record<StoreType, StoreTypeDefaults> = {
  CLOTHING: {
    productFields: {
      hasVariants: true,
      variantAxes: ["size", "colour"],
      extraFields: ["material", "careInstructions"],
      hasGender: true,
    },
    filters: ["category", "size", "colour", "gender", "price"],
    layout: {
      productCard: "fashion",
      listingGrid: "3-col",
      homepage: "hero-collections",
    },
  },

  ELECTRONICS: {
    productFields: {
      hasVariants: true,
      variantAxes: ["storage", "colour"],
      extraFields: ["brand", "warranty", "specs"],
      hasGender: false,
    },
    filters: ["category", "brand", "price", "warranty"],
    layout: {
      productCard: "tech",
      listingGrid: "4-col",
      homepage: "hero-deals",
    },
  },
}