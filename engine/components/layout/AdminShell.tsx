"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  Shirt,
  Layers,
  FolderTree,
  Bookmark,
  Receipt,
  Users,
  Settings,
} from "lucide-react"
import { useStore } from "@/engine/hooks/useStore"
import { AdminSignOutButton } from "@/engine/components/layout/AdminSignOutButton"

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Shirt },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Collections", href: "/admin/collections", icon: Bookmark },
  { label: "Orders", href: "/admin/orders", icon: Receipt },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { name } = useStore()

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-60 border-r bg-white">
        <div className="flex h-14 items-center border-b px-4">
          <span className="text-sm font-semibold">{name}</span>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-black text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex-1 pl-60">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b bg-white px-6">
          <span className="text-sm text-gray-500">Admin Dashboard</span>
          <div className="flex items-center gap-6">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium underline"
            >
              View Store
            </a>
            <AdminSignOutButton />
          </div>
        </header>

        {/* Page content */}
        <main className="overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}