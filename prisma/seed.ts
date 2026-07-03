import { config } from "dotenv"
config()

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database...")

  // ─── CATEGORIES ─────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: "T-Shirts", slug: "t-shirts", sortOrder: 1 },
    }),
    prisma.category.create({
      data: { name: "Dresses", slug: "dresses", sortOrder: 2 },
    }),
    prisma.category.create({
      data: { name: "Trousers", slug: "trousers", sortOrder: 3 },
    }),
    prisma.category.create({
      data: { name: "Sarees", slug: "sarees", sortOrder: 4 },
    }),
    prisma.category.create({
      data: { name: "Batik", slug: "batik", sortOrder: 5 },
    }),
    prisma.category.create({
      data: { name: "Accessories", slug: "accessories", sortOrder: 6 },
    }),
  ])

  const [tshirts, dresses, trousers, sarees, batik] = categories

  // ─── COLLECTIONS ────────────────────────────────────
  const newArrivals = await prisma.collection.create({
    data: { name: "New Arrivals", slug: "new-arrivals", sortOrder: 1 },
  })

  const sale = await prisma.collection.create({
    data: { name: "Sale", slug: "sale", sortOrder: 2 },
  })

  // ─── PRODUCTS + VARIANTS + IMAGES ──────────────────

  // Product 1 — Black Oversized Hoodie
  const hoodie = await prisma.product.create({
    data: {
      name: "Black Oversized Hoodie",
      slug: "black-oversized-hoodie",
      description:
        "A relaxed-fit oversized hoodie in soft brushed cotton. Perfect for layering.",
      categoryId: tshirts.id,
      basePrice: 3500,
      isFeatured: true,
      tags: ["hoodie", "streetwear", "unisex"],
      metadata: {
        material: "80% Cotton, 20% Polyester",
        careInstructions: "Machine wash cold. Do not bleach.",
        gender: "Unisex",
      },
    },
  })

  await prisma.productVariant.createMany({
    data: [
      {
        productId: hoodie.id,
        sku: "HOD-BLK-S",
        stock: 12,
        price: 3500,
        attributes: { size: "S", colour: "Black", colourHex: "#1a1a1a" },
      },
      {
        productId: hoodie.id,
        sku: "HOD-BLK-M",
        stock: 8,
        price: 3500,
        attributes: { size: "M", colour: "Black", colourHex: "#1a1a1a" },
      },
      {
        productId: hoodie.id,
        sku: "HOD-BLK-L",
        stock: 5,
        price: 3500,
        attributes: { size: "L", colour: "Black", colourHex: "#1a1a1a" },
      },
      {
        productId: hoodie.id,
        sku: "HOD-WHT-S",
        stock: 0,
        price: 3500,
        attributes: { size: "S", colour: "White", colourHex: "#f5f5f5" },
      },
      {
        productId: hoodie.id,
        sku: "HOD-WHT-M",
        stock: 6,
        price: 3500,
        attributes: { size: "M", colour: "White", colourHex: "#f5f5f5" },
      },
    ],
  })

  await prisma.image.create({
    data: {
      productId: hoodie.id,
      url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
      altText: "Black Oversized Hoodie",
      isPrimary: true,
    },
  })

  // Product 2 — Floral Summer Dress
  const dress = await prisma.product.create({
    data: {
      name: "Floral Summer Dress",
      slug: "floral-summer-dress",
      description:
        "Light, breathable summer dress with a floral print. Ideal for warm Sri Lankan weather.",
      categoryId: dresses.id,
      basePrice: 4200,
      isFeatured: true,
      tags: ["dress", "summer", "floral"],
      metadata: {
        material: "100% Viscose",
        careInstructions: "Hand wash recommended.",
        gender: "Women",
      },
    },
  })

  await prisma.productVariant.createMany({
    data: [
      {
        productId: dress.id,
        sku: "DRS-FLR-S",
        stock: 10,
        price: 4200,
        attributes: { size: "S", colour: "Floral Pink", colourHex: "#e8a0bf" },
      },
      {
        productId: dress.id,
        sku: "DRS-FLR-M",
        stock: 7,
        price: 4200,
        attributes: { size: "M", colour: "Floral Pink", colourHex: "#e8a0bf" },
      },
      {
        productId: dress.id,
        sku: "DRS-FLR-L",
        stock: 4,
        price: 4200,
        attributes: { size: "L", colour: "Floral Pink", colourHex: "#e8a0bf" },
      },
    ],
  })

  await prisma.image.create({
    data: {
      productId: dress.id,
      url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800",
      altText: "Floral Summer Dress",
      isPrimary: true,
    },
  })

  // Product 3 — Slim Fit Chino Trousers
  const chinos = await prisma.product.create({
    data: {
      name: "Slim Fit Chino Trousers",
      slug: "slim-fit-chino-trousers",
      description: "Classic slim fit chinos, versatile for work or casual wear.",
      categoryId: trousers.id,
      basePrice: 3800,
      tags: ["trousers", "chinos", "men"],
      metadata: {
        material: "98% Cotton, 2% Elastane",
        careInstructions: "Machine wash warm.",
        gender: "Men",
      },
    },
  })

  await prisma.productVariant.createMany({
    data: [
      {
        productId: chinos.id,
        sku: "CHN-KHK-M",
        stock: 15,
        price: 3800,
        attributes: { size: "M", colour: "Khaki", colourHex: "#c3b091" },
      },
      {
        productId: chinos.id,
        sku: "CHN-KHK-L",
        stock: 11,
        price: 3800,
        attributes: { size: "L", colour: "Khaki", colourHex: "#c3b091" },
      },
      {
        productId: chinos.id,
        sku: "CHN-NVY-M",
        stock: 9,
        price: 3800,
        attributes: { size: "M", colour: "Navy", colourHex: "#1f2d50" },
      },
    ],
  })

  await prisma.image.create({
    data: {
      productId: chinos.id,
      url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800",
      altText: "Slim Fit Chino Trousers",
      isPrimary: true,
    },
  })

  // Product 4 — Handwoven Silk Saree
  const saree = await prisma.product.create({
    data: {
      name: "Handwoven Silk Saree",
      slug: "handwoven-silk-saree",
      description:
        "Traditional handwoven silk saree with intricate border detailing.",
      categoryId: sarees.id,
      basePrice: 12500,
      isFeatured: true,
      tags: ["saree", "silk", "traditional"],
      metadata: {
        material: "100% Pure Silk",
        careInstructions: "Dry clean only.",
        gender: "Women",
      },
    },
  })

  await prisma.productVariant.createMany({
    data: [
      {
        productId: saree.id,
        sku: "SAR-GLD-FREE",
        stock: 6,
        price: 12500,
        attributes: { size: "Free Size", colour: "Gold", colourHex: "#d4af37" },
      },
      {
        productId: saree.id,
        sku: "SAR-MRN-FREE",
        stock: 4,
        price: 13000,
        attributes: { size: "Free Size", colour: "Maroon", colourHex: "#800020" },
      },
    ],
  })

  await prisma.image.create({
    data: {
      productId: saree.id,
      url: "https://images.unsplash.com/photo-1610189844774-b2a0420ebf09?w=800",
      altText: "Handwoven Silk Saree",
      isPrimary: true,
    },
  })

  // Product 5 — Batik Print Shirt
  const batikShirt = await prisma.product.create({
    data: {
      name: "Batik Print Shirt",
      slug: "batik-print-shirt",
      description: "Hand-dyed batik print shirt, a Sri Lankan classic.",
      categoryId: batik.id,
      basePrice: 4500,
      tags: ["batik", "shirt", "traditional"],
      metadata: {
        material: "100% Cotton",
        careInstructions: "Hand wash cold, dry in shade.",
        gender: "Men",
      },
    },
  })

  await prisma.productVariant.createMany({
    data: [
      {
        productId: batikShirt.id,
        sku: "BTK-BLU-M",
        stock: 8,
        price: 4500,
        attributes: { size: "M", colour: "Blue Batik", colourHex: "#2b4a6b" },
      },
      {
        productId: batikShirt.id,
        sku: "BTK-BLU-L",
        stock: 5,
        price: 4500,
        attributes: { size: "L", colour: "Blue Batik", colourHex: "#2b4a6b" },
      },
    ],
  })

  await prisma.image.create({
    data: {
      productId: batikShirt.id,
      url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800",
      altText: "Batik Print Shirt",
      isPrimary: true,
    },
  })

  // ─── ASSIGN PRODUCTS TO COLLECTIONS ─────────────────
  await prisma.productCollection.createMany({
    data: [
      { productId: hoodie.id, collectionId: newArrivals.id, sortOrder: 1 },
      { productId: dress.id, collectionId: newArrivals.id, sortOrder: 2 },
      { productId: saree.id, collectionId: newArrivals.id, sortOrder: 3 },
      { productId: chinos.id, collectionId: sale.id, sortOrder: 1 },
      { productId: batikShirt.id, collectionId: sale.id, sortOrder: 2 },
    ],
  })

  console.log("Seed complete:")
  console.log(`  ${categories.length} categories`)
  console.log("  5 products with variants and images")
  console.log("  2 collections")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })