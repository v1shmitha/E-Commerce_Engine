import { createClient } from "@/engine/lib/supabase/server"
import { signOut } from "@/engine/api/auth"
import { redirect } from "next/navigation"

export default async function AccountPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-xl font-semibold">Welcome, {data.user.email}</h1>

      <form action={signOut}>
        <button
          type="submit"
          className="rounded-md border px-4 py-2 text-sm font-medium"
        >
          Log out
        </button>
      </form>
    </div>
  )
}