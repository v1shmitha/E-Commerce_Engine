import { getSettings, updateSettings } from "@/engine/api/settings"
import { storeConfig } from "@/engine/lib/config"

export default async function AdminSettingsPage() {
  const saved = await getSettings()

  const name = saved.store_name ?? storeConfig.name
  const flatRate = saved.shipping_flat_rate ?? String(storeConfig.shipping.flatRate)
  const freeThreshold = saved.shipping_free_threshold ?? String(storeConfig.shipping.freeThreshold)
  const primaryColor = saved.primary_color ?? storeConfig.theme.primaryColor
  const accentColor = saved.accent_color ?? storeConfig.theme.accentColor

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-gray-500">
        These values override the default store config.
      </p>

      <form action={updateSettings} className="mt-6 space-y-8">

        <div className="space-y-4">
          <h2 className="text-sm font-semibold">Store</h2>
          <div className="space-y-2">
            <label htmlFor="store_name" className="text-sm font-medium">
              Store name
            </label>
            <input
              id="store_name"
              name="store_name"
              defaultValue={name}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold">Shipping (LKR)</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="shipping_flat_rate" className="text-sm font-medium">
                Flat rate
              </label>
              <input
                id="shipping_flat_rate"
                name="shipping_flat_rate"
                type="number"
                defaultValue={flatRate}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="shipping_free_threshold" className="text-sm font-medium">
                Free shipping above
              </label>
              <input
                id="shipping_free_threshold"
                name="shipping_free_threshold"
                type="number"
                defaultValue={freeThreshold}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Orders above the free threshold get free shipping. Others pay the flat rate.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold">Theme</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="primary_color" className="text-sm font-medium">
                Primary colour
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="primary_color"
                  name="primary_color"
                  defaultValue={primaryColor}
                  className="h-9 w-12 cursor-pointer rounded-md border px-1"
                />
                <span className="text-sm text-gray-500">{primaryColor}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="accent_color" className="text-sm font-medium">
                Accent colour
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="accent_color"
                  name="accent_color"
                  defaultValue={accentColor}
                  className="h-9 w-12 cursor-pointer rounded-md border px-1"
                />
                <span className="text-sm text-gray-500">{accentColor}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Save Settings
        </button>
      </form>
    </div>
  )
}