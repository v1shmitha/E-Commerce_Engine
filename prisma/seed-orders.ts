import { config } from "dotenv"
config()

import { PrismaClient, OrderStatus, PaymentStatus, PaymentMethod } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding test orders...")

  // 1. Get existing customers
  const customers = await prisma.customer.findMany()
  if (customers.length === 0) {
    console.error("No customers found in database. Run pnpm seed first.")
    return
  }
  
  const customer = customers.find(c => c.role === "CUSTOMER") || customers[0]
  console.log(`Using customer: ${customer.email} (${customer.id})`)

  // 2. Get product variants
  const variants = await prisma.productVariant.findMany({
    include: { product: true }
  })
  
  if (variants.length < 3) {
    console.error("Not enough product variants found. Run pnpm seed first.")
    return
  }

  // 3. Create a helper for shipping addresses
  const address = await prisma.address.create({
    data: {
      customerId: customer.id,
      label: "Home",
      fullName: `${customer.firstName} ${customer.lastName}`,
      phone: customer.phone || "0771234567",
      addressLine1: "123 Galle Road",
      addressLine2: "Kollupitaya",
      city: "Colombo 03",
      district: "Colombo",
      province: "Western",
      postalCode: "00300",
      isDefault: true,
    }
  })
  console.log(`Created shipping address: ${address.id}`)

  // 4. Create Order 1 (PENDING)
  // Hoodie (variant 0)
  const item1_1 = variants[0]
  const q1 = 2
  const subtotal1 = Number(item1_1.price) * q1
  const shipping1 = 350
  const total1 = subtotal1 + shipping1

  const order1 = await prisma.order.create({
    data: {
      orderNumber: `ORD-2026-0001`,
      customerId: customer.id,
      shippingAddressId: address.id,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod: PaymentMethod.CARD,
      subtotal: subtotal1,
      shippingFee: shipping1,
      discount: 0,
      total: total1,
      notes: "Please leave package with the security guard.",
      items: {
        create: {
          variantId: item1_1.id,
          quantity: q1,
          unitPrice: item1_1.price,
          totalPrice: Number(item1_1.price) * q1,
        }
      },
      payment: {
        create: {
          payhereOrderId: `PAY-ORD-0001`,
          amount: total1,
          currency: "LKR",
          status: PaymentStatus.PENDING,
          method: PaymentMethod.CARD,
        }
      }
    }
  })
  console.log(`Created Order 1: ${order1.orderNumber}`)

  // 5. Create Order 2 (PROCESSING)
  // Dress (variant 1) + Chino (variant 2)
  const item2_1 = variants[1]
  const item2_2 = variants[2]
  const q2_1 = 1
  const q2_2 = 1
  const subtotal2 = (Number(item2_1.price) * q2_1) + (Number(item2_2.price) * q2_2)
  const shipping2 = 350
  const total2 = subtotal2 + shipping2

  const order2 = await prisma.order.create({
    data: {
      orderNumber: `ORD-2026-0002`,
      customerId: customer.id,
      shippingAddressId: address.id,
      status: OrderStatus.PROCESSING,
      paymentStatus: PaymentStatus.COMPLETED,
      paymentMethod: PaymentMethod.CARD,
      subtotal: subtotal2,
      shippingFee: shipping2,
      discount: 0,
      total: total2,
      notes: "Wrap in gift box if possible.",
      items: {
        createMany: {
          data: [
            {
              variantId: item2_1.id,
              quantity: q2_1,
              unitPrice: item2_1.price,
              totalPrice: Number(item2_1.price) * q2_1,
            },
            {
              variantId: item2_2.id,
              quantity: q2_2,
              unitPrice: item2_2.price,
              totalPrice: Number(item2_2.price) * q2_2,
            }
          ]
        }
      },
      payment: {
        create: {
          payhereOrderId: `PAY-ORD-0002`,
          payherePaymentId: `PAY-ID-98234823`,
          amount: total2,
          currency: "LKR",
          status: PaymentStatus.COMPLETED,
          method: PaymentMethod.CARD,
          statusCode: 2,
          statusMessage: "Success",
          notifyReceivedAt: new Date(),
        }
      }
    }
  })
  console.log(`Created Order 2: ${order2.orderNumber}`)

  // 6. Create Order 3 (DELIVERED)
  // Saree (variant 3)
  const item3_1 = variants[3] || variants[0]
  const q3 = 1
  const subtotal3 = Number(item3_1.price) * q3
  const shipping3 = 350
  const total3 = subtotal3 + shipping3

  const order3 = await prisma.order.create({
    data: {
      orderNumber: `ORD-2026-0003`,
      customerId: customer.id,
      shippingAddressId: address.id,
      status: OrderStatus.DELIVERED,
      paymentStatus: PaymentStatus.COMPLETED,
      paymentMethod: PaymentMethod.EZ_CASH,
      subtotal: subtotal3,
      shippingFee: shipping3,
      discount: 0,
      total: total3,
      items: {
        create: {
          variantId: item3_1.id,
          quantity: q3,
          unitPrice: item3_1.price,
          totalPrice: Number(item3_1.price) * q3,
        }
      },
      payment: {
        create: {
          payhereOrderId: `PAY-ORD-0003`,
          payherePaymentId: `PAY-ID-12837192`,
          amount: total3,
          currency: "LKR",
          status: PaymentStatus.COMPLETED,
          method: PaymentMethod.EZ_CASH,
          statusCode: 2,
          statusMessage: "Success",
          notifyReceivedAt: new Date(),
        }
      }
    }
  })
  console.log(`Created Order 3: ${order3.orderNumber}`)

  console.log("Seeding test orders complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
