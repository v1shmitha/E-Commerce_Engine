import { config } from "dotenv"
config()

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

// Percent-encode the password's '@' symbol if present
const rawUrl = process.env.DATABASE_URL!
const connectionString = rawUrl.replace("ClothEng@987", "ClothEng%40987")

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  const customers = await prisma.customer.findMany()
  console.log("Customers in DB:", customers.length)
  for (const c of customers) {
    console.log(`- ID: ${c.id}, Email: ${c.email}, Role: ${c.role}, Name: ${c.firstName} ${c.lastName}`)
  }

  const orders = await prisma.order.findMany()
  console.log("Orders in DB:", orders.length)
  
  const variants = await prisma.productVariant.findMany({
    include: { product: true }
  })
  console.log("Variants in DB:", variants.length)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
