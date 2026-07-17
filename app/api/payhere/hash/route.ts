import { NextRequest, NextResponse } from "next/server"
import { generatePayHereHash, formatAmount } from "@/engine/lib/payhere"
import { createClient } from "@/engine/lib/supabase/server"

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { orderId, amount } = await req.json()

  if (!orderId || !amount) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const merchantId = process.env.PAYHERE_MERCHANT_ID!
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!
  const currency = "LKR"
  const formattedAmount = formatAmount(Number(amount))

  const hash = generatePayHereHash({
    merchantId,
    orderId,
    amount: formattedAmount,
    currency,
    merchantSecret,
  })

  return NextResponse.json({
    hash,
    merchantId,
    amount: formattedAmount,
    currency,
    sandbox: process.env.PAYHERE_SANDBOX === "true",
  })
}