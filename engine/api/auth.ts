"use server";

import { createClient } from "@/engine/lib/supabase/server";
import { prisma } from "@/engine/lib/prisma";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: error?.message ?? "Sign up failed" };
  }

  // Create matching Customer record in Prisma
  await prisma.customer.create({
    data: {
      id: data.user.id,
      email,
      firstName,
      lastName,
    },
  });

  redirect("/account");
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Sign in failed" };
  }

  const customer = await prisma.customer.findUnique({
    where: { id: data.user.id },
    select: { role: true },
  });

  if (customer?.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  redirect("/account");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
