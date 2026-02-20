import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function DeliverySettings() {

  const [boys, setBoys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeliveryBoys()
  }, [])

  const fetchDeliveryBoys = async () => {
    const res = await fetch("/api/admin/delivery/list")
    const data = await res.json()

    if (res.ok) {
      setBoys(data.deliveryBoys)
    }
    setLoading(false)
  }

  // 🔥 SINGLE UPDATE FUNCTION (Capacity + Commission)
  const updateDeliverySettings = async (boy: any) => {

    const res = await fetch("/api/admin/delivery/update-capacity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deliveryBoyId: boy.id,
        maxActiveOrders: boy.maxActiveOrders,
        commissionType: boy.commissionType,
        commissionValue: boy.commissionValue
      })
    })

    const data = await res.json()

    if (res.ok) {
      toast.success(data.message)
    } else {
      toast.error(data.message)
    }
  }

  if (loading) return <div className="p-6"><div className="animate-pulse h-40 bg-gray-200 rounded-xl" /></div>

  return (
    <div className="w-full mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        Delivery Boy Settings
      </h1>

      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Max Orders</th>
              <th className="p-4">Commission Type</th>
              <th className="p-4">Commission Value</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {boys.map((boy, index) => (
              <tr key={boy.id} className="border-t">

                <td className="p-4">{boy.name}</td>
                <td className="p-4">{boy.phone}</td>

                <td className="p-4">
                  <input
                    type="number"
                    value={boy.maxActiveOrders}
                    onChange={(e) => {
                      const updated = [...boys]
                      updated[index].maxActiveOrders = Number(e.target.value)
                      setBoys(updated)
                    }}
                    className="border p-1 rounded w-20"
                  />
                </td>

                <td className="p-4">
                  <select
                    value={boy.commissionType || "PERCENTAGE"}
                    onChange={(e) => {
                      const updated = [...boys]
                      updated[index].commissionType = e.target.value
                      setBoys(updated)
                    }}
                    className="border p-1 rounded"
                  >
                    <option value="PERCENTAGE">%</option>
                    <option value="FLAT">Flat ₹</option>
                  </select>
                </td>

                <td className="p-4">
                  <input
                    type="number"
                    value={boy.commissionValue || 0}
                    onChange={(e) => {
                      const updated = [...boys]
                      updated[index].commissionValue = Number(e.target.value)
                      setBoys(updated)
                    }}
                    className="border p-1 rounded w-24"
                  />
                </td>

                <td className="p-4">
                  <button
                    onClick={() => updateDeliverySettings(boy)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                  >
                    Save
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
