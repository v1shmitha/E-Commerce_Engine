"use client"

import Link from "next/link"
import { ShoppingCart, Search, Heart, User, Menu, X } from "lucide-react"
import { useStore } from "@/engine/hooks/useStore"
import { useCart } from "@/engine/hooks/useCart"
import { useState } from "react"

export default function StorefrontNav() {
  const { name } = useStore()
  const { items } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const navLinks = [
    { label: "New Arrivals", href: "/collections/new-arrivals" },
    { label: "Shop All", href: "/products" },
    { label: "Categories", href: "/categories" },
    { label: "Sale", href: "/collections/sale" },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E0E0E0]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link
          href="/"
          className="text-[#0A0A0A] text-sm font-medium tracking-[0.2em] uppercase"
        >
          {name}
        </Link>

        {/* Desktop Nav — centred */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#8C8C8C] hover:text-[#0A0A0A] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-5">
          <Link href="/search" className="text-[#8C8C8C] hover:text-[#0A0A0A] transition-colors">
            <Search className="h-4 w-4" />
          </Link>
          <Link href="/account/wishlist" className="text-[#8C8C8C] hover:text-[#0A0A0A] transition-colors">
            <Heart className="h-4 w-4" />
          </Link>
          <Link href="/account" className="text-[#8C8C8C] hover:text-[#0A0A0A] transition-colors">
            <User className="h-4 w-4" />
          </Link>
          <Link href="/cart" className="relative text-[#8C8C8C] hover:text-[#0A0A0A] transition-colors">
            <ShoppingCart className="h-4 w-4" />
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center bg-[#0A0A0A] text-[9px] font-medium text-white">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            className="text-[#8C8C8C] md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-[#E0E0E0] bg-white px-6 py-8 md:hidden">
          <nav className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#8C8C8C] hover:text-[#0A0A0A]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}