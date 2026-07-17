import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/engine/lib/prisma";

// Orders left unpaid for longer than this are auto-cancelled.
// Stock is only decremented on successful payment (see /api/payhere/notify),
// so a stale PENDING order holds no stock — this is pure cleanup.
const STALE_AFTER_MINUTES = 60;

export async function GET(request: NextRequest) {
  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is set.
  // Reject anything that doesn't match so the endpoint can't be triggered publicly.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const cutoff = new Date(Date.now() - STALE_AFTER_MINUTES * 60 * 1000);

  const result = await prisma.order.updateMany({
    where: {
      status: "PENDING",
      paymentStatus: "PENDING",
      createdAt: { lt: cutoff },
    },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({
    ok: true,
    cancelled: result.count,
    cutoff: cutoff.toISOString(),
  });
}
