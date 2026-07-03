const stats = [
  { label: "Total Revenue", value: "LKR 0" },
  { label: "Total Orders", value: "0" },
  { label: "Total Products", value: "5" },
  { label: "Total Customers", value: "0" },
]

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border bg-white p-4"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}