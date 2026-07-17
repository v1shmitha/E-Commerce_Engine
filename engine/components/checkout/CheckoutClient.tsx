"use client";

import { useState } from "react";
import { useCart } from "@/engine/hooks/useCart";
import { useRouter } from "next/navigation";
import { createCheckoutOrder } from "@/engine/api/checkout";

type Address = {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  district: string;
  province: string;
  postalCode: string | null;
  isDefault: boolean;
};

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
};

export default function CheckoutClient({
  customer,
  savedAddresses,
}: {
  customer: Customer;
  savedAddresses: Address[];
}) {
  const { items, total, clearCart } = useCart();
  const router = useRouter();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    savedAddresses.find((a) => a.isDefault)?.id ??
      savedAddresses[0]?.id ??
      null,
  );
  const [useNewAddress, setUseNewAddress] = useState(
    savedAddresses.length === 0,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newAddress, setNewAddress] = useState({
    fullName: `${customer.firstName} ${customer.lastName}`,
    phone: customer.phone ?? "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    district: "",
    province: "",
    postalCode: "",
  });

  const cartTotal = total();
  const shippingFee = cartTotal >= 5000 ? 0 : 350;
  const orderTotal = cartTotal + shippingFee;

  function formatLKR(amount: number) {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  async function handleCheckout() {
    if (items.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      const selectedSaved = savedAddresses.find(
        (a) => a.id === selectedAddressId,
      );
      const shippingAddress =
        useNewAddress || !selectedAddressId || !selectedSaved
          ? newAddress
          : {
              fullName: selectedSaved.fullName,
              phone: selectedSaved.phone,
              addressLine1: selectedSaved.addressLine1,
              addressLine2: selectedSaved.addressLine2 ?? undefined,
              city: selectedSaved.city,
              district: selectedSaved.district,
              province: selectedSaved.province,
              postalCode: selectedSaved.postalCode ?? undefined,
            };

      const result = await createCheckoutOrder({
        customerId: customer.id,
        items: items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
          unitPrice: i.price,
        })),
        shippingAddress,
        existingAddressId:
          !useNewAddress && selectedAddressId ? selectedAddressId : null,
        subtotal: cartTotal,
        shippingFee,
        total: orderTotal,
      });

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Get hash from server
      const hashRes = await fetch("/api/payhere/hash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: result.payhereOrderId,
          amount: orderTotal,
        }),
      });
      const hashData = await hashRes.json();

      if (hashData.error) {
        setError(hashData.error);
        setLoading(false);
        return;
      }

      // Trigger PayHere onsite checkout
      const payment = {
        sandbox: hashData.sandbox,
        merchant_id: hashData.merchantId,
        return_url: `${window.location.origin}/checkout/success`,
        cancel_url: `${window.location.origin}/checkout/cancel`,
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payhere/notify`,
        order_id: result.payhereOrderId,
        items: items.map((i) => i.productName).join(", "),
        amount: hashData.amount,
        currency: hashData.currency,
        hash: hashData.hash,
        first_name: customer.firstName,
        last_name: customer.lastName,
        email: customer.email,
        phone: (shippingAddress as any).phone,
        address: (shippingAddress as any).addressLine1,
        city: (shippingAddress as any).city,
        country: "Sri Lanka",
      };

      // @ts-ignore — PayHere JS SDK is loaded via script tag
      payhere.startPayment(payment);

      // @ts-ignore
      payhere.onCompleted = function (orderId: string) {
        clearCart();
        router.push(`/checkout/success?order=${result.orderId}`);
      };

      // @ts-ignore
      payhere.onDismissed = function () {
        setLoading(false);
      };

      // @ts-ignore
      payhere.onError = function (error: string) {
        setError(`Payment error: ${error}`);
        setLoading(false);
      };
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-[#8C8C8C] text-sm">Your cart is empty.</p>
        <a
          href="/products"
          className="mt-6 inline-block bg-[#0A0A0A] text-white px-6 py-3 text-[11px] font-medium tracking-[0.2em] uppercase"
        >
          Continue Shopping
        </a>
      </div>
    );
  }

  const sriLankaDistricts = [
    "Ampara",
    "Anuradhapura",
    "Badulla",
    "Batticaloa",
    "Colombo",
    "Galle",
    "Gampaha",
    "Hambantota",
    "Jaffna",
    "Kalutara",
    "Kandy",
    "Kegalle",
    "Kilinochchi",
    "Kurunegala",
    "Mannar",
    "Matale",
    "Matara",
    "Monaragala",
    "Mullaitivu",
    "Nuwara Eliya",
    "Polonnaruwa",
    "Puttalam",
    "Ratnapura",
    "Trincomalee",
    "Vavuniya",
  ];

  const sriLankaProvinces = [
    "Central",
    "Eastern",
    "North Central",
    "Northern",
    "North Western",
    "Sabaragamuwa",
    "Southern",
    "Uva",
    "Western",
  ];

  return (
    <div className="grid md:grid-cols-2 gap-12">
      {/* Left — Address */}
      <div>
        <h2
          className="text-lg text-[#0A0A0A] mb-6"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Shipping Address
        </h2>

        {savedAddresses.length > 0 && (
          <div className="space-y-3 mb-6">
            {savedAddresses.map((address) => (
              <label
                key={address.id}
                className={`flex items-start gap-3 border p-4 cursor-pointer transition-colors ${
                  selectedAddressId === address.id && !useNewAddress
                    ? "border-[#0A0A0A]"
                    : "border-[#E0E0E0] hover:border-[#8C8C8C]"
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  value={address.id}
                  checked={selectedAddressId === address.id && !useNewAddress}
                  onChange={() => {
                    setSelectedAddressId(address.id);
                    setUseNewAddress(false);
                  }}
                  className="mt-0.5 accent-[#0A0A0A]"
                />
                <div className="text-sm">
                  <p className="font-medium text-[#0A0A0A]">
                    {address.fullName}
                    {address.isDefault && (
                      <span className="ml-2 text-[10px] tracking-[0.1em] uppercase text-[#8C8C8C]">
                        Default
                      </span>
                    )}
                  </p>
                  <p className="text-[#8C8C8C] mt-0.5">
                    {address.addressLine1}
                    {address.addressLine2 && `, ${address.addressLine2}`}
                  </p>
                  <p className="text-[#8C8C8C]">
                    {address.city}, {address.district}
                  </p>
                  <p className="text-[#8C8C8C]">{address.phone}</p>
                </div>
              </label>
            ))}

            <label
              className={`flex items-center gap-3 border p-4 cursor-pointer transition-colors ${
                useNewAddress
                  ? "border-[#0A0A0A]"
                  : "border-[#E0E0E0] hover:border-[#8C8C8C]"
              }`}
            >
              <input
                type="radio"
                name="address"
                checked={useNewAddress}
                onChange={() => setUseNewAddress(true)}
                className="accent-[#0A0A0A]"
              />
              <span className="text-sm text-[#0A0A0A]">
                Use a different address
              </span>
            </label>
          </div>
        )}

        {(useNewAddress || savedAddresses.length === 0) && (
          <div className="space-y-4">
            {[
              { key: "fullName", label: "Full Name", type: "text" },
              { key: "phone", label: "Phone", type: "text" },
              { key: "addressLine1", label: "Address Line 1", type: "text" },
              {
                key: "addressLine2",
                label: "Address Line 2 (optional)",
                type: "text",
              },
              { key: "city", label: "City", type: "text" },
              {
                key: "postalCode",
                label: "Postal Code (optional)",
                type: "text",
              },
            ].map((field) => (
              <div key={field.key} className="space-y-1.5">
                <label className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C]">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={(newAddress as any)[field.key]}
                  onChange={(e) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  className="w-full border border-[#E0E0E0] px-3 py-2.5 text-sm focus:border-[#0A0A0A] outline-none transition-colors"
                />
              </div>
            ))}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C]">
                  District
                </label>
                <select
                  value={newAddress.district}
                  onChange={(e) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      district: e.target.value,
                    }))
                  }
                  className="w-full border border-[#E0E0E0] px-3 py-2.5 text-sm focus:border-[#0A0A0A] outline-none bg-white"
                >
                  <option value="">Select</option>
                  {sriLankaDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C]">
                  Province
                </label>
                <select
                  value={newAddress.province}
                  onChange={(e) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      province: e.target.value,
                    }))
                  }
                  className="w-full border border-[#E0E0E0] px-3 py-2.5 text-sm focus:border-[#0A0A0A] outline-none bg-white"
                >
                  <option value="">Select</option>
                  {sriLankaProvinces.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right — Order Summary */}
      <div>
        <h2
          className="text-lg text-[#0A0A0A] mb-6"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Order Summary
        </h2>

        <div className="border border-[#E0E0E0] divide-y divide-[#E0E0E0] mb-6">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="flex items-center justify-between p-4"
            >
              <div>
                <p className="text-sm font-medium text-[#0A0A0A]">
                  {item.productName}
                </p>
                <p className="text-xs text-[#8C8C8C] mt-0.5">
                  {item.size} / {item.colour} · Qty {item.quantity}
                </p>
              </div>
              <p className="text-sm text-[#0A0A0A]">
                {formatLKR(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-2 text-sm mb-6">
          <div className="flex justify-between text-[#8C8C8C]">
            <span>Subtotal</span>
            <span>{formatLKR(cartTotal)}</span>
          </div>
          <div className="flex justify-between text-[#8C8C8C]">
            <span>Shipping</span>
            <span>{shippingFee === 0 ? "Free" : formatLKR(shippingFee)}</span>
          </div>
          <div className="flex justify-between font-medium text-[#0A0A0A] border-t border-[#E0E0E0] pt-2">
            <span>Total</span>
            <span>{formatLKR(orderTotal)}</span>
          </div>
        </div>

        {error && (
          <p className="mb-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-[#0A0A0A] text-white py-4 text-[11px] font-medium tracking-[0.2em] uppercase hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
        >
          {loading ? "Processing..." : `Pay ${formatLKR(orderTotal)}`}
        </button>

        <p className="mt-3 text-center text-xs text-[#8C8C8C]">
          Secured by PayHere · Visa · Mastercard · eZ Cash
        </p>
      </div>
    </div>
  );
}
