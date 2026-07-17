import crypto from "crypto"

export function generatePayHereHash({
  merchantId,
  orderId,
  amount,
  currency,
  merchantSecret,
}: {
  merchantId: string
  orderId: string
  amount: string
  currency: string
  merchantSecret: string
}) {
  const hashedSecret = crypto
    .createHash("md5")
    .update(merchantSecret)
    .digest("hex")
    .toUpperCase()

  const hash = crypto
    .createHash("md5")
    .update(
      merchantId +
        orderId +
        amount +
        currency +
        hashedSecret
    )
    .digest("hex")
    .toUpperCase()

  return hash
}

export function verifyPayHereHash({
  merchantId,
  orderId,
  amount,
  currency,
  statusCode,
  merchantSecret,
  receivedHash,
}: {
  merchantId: string
  orderId: string
  amount: string
  currency: string
  statusCode: string
  merchantSecret: string
  receivedHash: string
}) {
  const hashedSecret = crypto
    .createHash("md5")
    .update(merchantSecret)
    .digest("hex")
    .toUpperCase()

  const hash = crypto
    .createHash("md5")
    .update(
      merchantId +
        orderId +
        amount +
        currency +
        statusCode +
        hashedSecret
    )
    .digest("hex")
    .toUpperCase()

  return hash === receivedHash.toUpperCase()
}

export function formatAmount(amount: number): string {
  return amount.toFixed(2)
}