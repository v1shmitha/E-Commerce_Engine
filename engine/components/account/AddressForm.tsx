"use client"

import { createAddress } from "@/engine/api/addresses"

const sriLankaDistricts = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
  "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
  "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
  "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya",
]

const sriLankaProvinces = [
  "Central", "Eastern", "North Central", "Northern",
  "North Western", "Sabaragamuwa", "Southern", "Uva", "Western",
]

export function AddressForm() {
  return (
    <form action={createAddress} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C]">
            Label (optional)
          </label>
          <input
            name="label"
            placeholder="Home, Office..."
            className="w-full border border-[#E0E0E0] px-3 py-2.5 text-sm focus:border-[#0A0A0A] outline-none transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C]">
            Full Name
          </label>
          <input
            name="fullName"
            required
            className="w-full border border-[#E0E0E0] px-3 py-2.5 text-sm focus:border-[#0A0A0A] outline-none transition-colors"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C]">
          Phone
        </label>
        <input
          name="phone"
          required
          className="w-full border border-[#E0E0E0] px-3 py-2.5 text-sm focus:border-[#0A0A0A] outline-none transition-colors"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C]">
          Address Line 1
        </label>
        <input
          name="addressLine1"
          required
          className="w-full border border-[#E0E0E0] px-3 py-2.5 text-sm focus:border-[#0A0A0A] outline-none transition-colors"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C]">
          Address Line 2 (optional)
        </label>
        <input
          name="addressLine2"
          className="w-full border border-[#E0E0E0] px-3 py-2.5 text-sm focus:border-[#0A0A0A] outline-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C]">
            City
          </label>
          <input
            name="city"
            required
            className="w-full border border-[#E0E0E0] px-3 py-2.5 text-sm focus:border-[#0A0A0A] outline-none transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C]">
            Postal Code
          </label>
          <input
            name="postalCode"
            className="w-full border border-[#E0E0E0] px-3 py-2.5 text-sm focus:border-[#0A0A0A] outline-none transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C]">
            District
          </label>
          <select
            name="district"
            required
            className="w-full border border-[#E0E0E0] px-3 py-2.5 text-sm focus:border-[#0A0A0A] outline-none transition-colors bg-white"
          >
            <option value="">Select district</option>
            {sriLankaDistricts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C]">
            Province
          </label>
          <select
            name="province"
            required
            className="w-full border border-[#E0E0E0] px-3 py-2.5 text-sm focus:border-[#0A0A0A] outline-none transition-colors bg-white"
          >
            <option value="">Select province</option>
            {sriLankaProvinces.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-[#0A0A0A] cursor-pointer">
        <input type="checkbox" name="isDefault" className="accent-[#0A0A0A]" />
        Set as default address
      </label>

      <button
        type="submit"
        className="w-full bg-[#0A0A0A] text-white py-3 text-[11px] font-medium tracking-[0.2em] uppercase hover:bg-[#2a2a2a] transition-colors"
      >
        Save Address
      </button>
    </form>
  )
}