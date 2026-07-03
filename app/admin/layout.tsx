import { createClient } from "@/engine/lib/supabase/server"
import { prisma } from "@/engine/lib/prisma"
import { redirect } from "next/navigation"
import { AdminShell } from "@/engine/components/layout/AdminShell"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    redirect("/login")
  }

  const customer = await prisma.customer.findUnique({
    where: { id: data.user.id },
    select: { role: true },
  })

  if (!customer || customer.role !== "ADMIN") {
    redirect("/")
  }

  return <AdminShell>{children}</AdminShell>
}