import { useEffect, useState } from "react"

export default function DeliveryEarnings() {

  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch("/api/delivery/earnings")
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) return <div className="p-6"><div className="animate-pulse h-40 bg-gray-200 rounded-xl" /></div>

  // 🔥 ADD NEW — Calculations
  const totalOrders = data.earnings.length

  const totalOrderValue = data.earnings.reduce(
    (sum: number, e: any) => sum + e.orderAmount,
    0
  )

  const totalEarning = data.totalEarning

  return (
    <div className="mx-auto space-y-6">

      <h1 className="text-2xl font-bold">
        Delivery Earnings Dashboard
      </h1>

      {/* 🔥 SUMMARY CARDS */}
      <div className="grid md:grid-cols-3 gap-4">

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500 text-sm">
            Delivered Orders
          </p>
          <p className="text-2xl font-bold mt-2">
            {totalOrders}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500 text-sm">
            Total Order Value
          </p>
          <p className="text-2xl font-bold mt-2">
            ₹{totalOrderValue.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500 text-sm">
            Total Earnings
          </p>
          <p className="text-2xl font-bold mt-2 text-green-700">
            ₹{totalEarning.toFixed(2)}
          </p>
        </div>

      </div>

      {/* 🔥 EARNING LIST */}
      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="border-b px-5 py-3 font-semibold bg-gray-50">
          Earnings Breakdown
        </div>

        {data.earnings.length === 0 && (
          <div className="p-6 text-gray-500 text-center">
            No earnings yet
          </div>
        )}

        {data.earnings.map((e: any) => (
          <div
            key={e.id}
            className="border-b p-4 flex justify-between items-center hover:bg-gray-50 transition"
          >
            <div>
              <p className="font-semibold">
                Order #{e.order.orderNumber}
              </p>
              <p className="text-xs text-gray-500">
                Order Value: ₹{e.orderAmount}
              </p>
            </div>

            <div className="text-right">
              <p className="font-bold text-green-600">
                ₹{e.earningAmount}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(e.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}

      </div>

    </div>
  )
}
