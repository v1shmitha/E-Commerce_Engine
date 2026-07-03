export const storeConfig = {
  name: "My Clothing Store",
  currency: "LKR",
  locale: "en-LK",

  theme: {
    primaryColor: "#1a1a1a",
    accentColor: "#c8a96e",
    font: "Inter",
  },

  productFields: {
    hasVariants: true,
    variantAxes: ["size", "colour"] as const,
    extraFields: ["material", "careInstructions"],
    hasGender: true,
  },

  filters: ["category", "size", "colour", "gender", "price"] as const,

  shipping: {
    freeThreshold: 5000,
    flatRate: 350,
  },

  layout: {
    productCard: "fashion" as const,
    listingGrid: "3-col" as const,
    homepage: "hero-collections" as const,
  },

  categories: [
    "T-Shirts",
    "Dresses",
    "Trousers",
    "Sarees",
    "Batik",
    "Accessories",
  ],
} as const

export type StoreConfig = typeof storeConfig