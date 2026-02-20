import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useRouter } from "next/router"

export default function AdminOrders() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null)
  const [refundAmount, setRefundAmount] = useState("")

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    const res = await fetch("/api/admin/orders/list")
    const data = await res.json()

    if (res.ok) {
      setOrders(data.orders)
    }
    setLoading(false)
  }

  const openRefundModal = (orderId: number) => {
    setSelectedOrder(orderId)
  }

  const handleRefund = async () => {

    const res = await fetch("/api/admin/orders/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: selectedOrder,
        refundAmount: Number(refundAmount)
      })
    })
    console.log(orders)
    const data = await res.json()

    if (res.ok) {
      toast.success(data.message)
      fetchOrders()
    } else {
      toast.error(data.message)
    }

    setSelectedOrder(null)
    setRefundAmount("")
  }

  const deleteOrder = async (orderId: number) => {

    const res = await fetch("/api/admin/orders/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId })
    })

    const data = await res.json()

    if (res.ok) {
      toast.success(data.message)
      fetchOrders()
    } else {
      toast.error(data.message)
    }
  }

  // 🔥 ADD NEW — STATUS UPDATE FUNCTION
  const updateStatus = async (
    orderId: number,
    status: string,
    deliveryBoyId?: number
  ) => {

    const res = await fetch("/api/admin/orders/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        status,
        deliveryBoyId
      })
    })

    const data = await res.json()

    if (res.ok) {
      toast.success(data.message)
      fetchOrders()
    } else {
      toast.error(data.message)
    }
  }


  if (loading) return <div className="p-6"><div className="animate-pulse h-40 bg-gray-200 rounded-xl" /></div>

  return (
    <div className="">

      <h1 className="text-2xl font-bold mb-6">Admin Orders</h1>

      <div className="bg-white shadow rounded-xl overflow-auto">
        <div className="scrollbar-thin scrollbar-thumb-gray-300">
          <table className="text-sm tex">
            <thead className="bg-gray-100 text-left w-full">
              <tr>
                <th className="p-4">Order</th>
                <th className="p-4">User</th>
                <th className="p-4">Restaurant</th>
                <th className="p-4">Items</th>
                <th className="p-4">Delivery Boy</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Refund</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-t">

                  <td className="p-4">
                    <p className="font-semibold">
                      #{order.orderNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </td>

                  <td className="p-4">
                    {order.user?.name}
                  </td>

                  <td className="p-4">
                    {order.restaurant?.name}
                  </td>
                  <td className="p-4">
                    <div className="space-y-3">
                      {order.items?.map((item: any) => (
                        <div
                          key={item.id}
                          className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm hover:shadow-md transition flex gap-3"
                        >

                          {/* 🔥 Product Image */}
                          <img
                            src={item.product?.image || "/placeholder.jpg"}
                            className="w-14 h-14 rounded-lg object-cover border"
                          />

                          <div className="flex-1 text-xs">

                            {/* 🔥 Product Name */}
                            <p className="font-semibold text-gray-800">
                              {item.product?.name} × {item.quantity}
                            </p>

                            {/* 🔥 Variant */}
                            {item.variant?.name && (
                              <p className="text-gray-500">
                                Size: <span className="font-medium">{item.variant.name}</span>
                              </p>
                            )}

                            {/* 🔥 Extras */}
                            {Array.isArray(item.selectedExtras) && item.selectedExtras.length > 0 && (
                              <div className="text-gray-500">
                                {item.selectedExtras.map((ex: any, i: number) => (
                                  <p key={i}>
                                    + {ex.name} (₹{ex.price})
                                  </p>
                                ))}
                              </div>
                            )}

                            {/* 🔥 Item Total */}
                            <p className="text-[#FF6B00] font-semibold mt-1">
                              ₹{Number(item.price || 0) * Number(item.quantity || 1)}
                            </p>

                          </div>
                        </div>

                      ))}
                    </div>
                  </td>

                  <td className="p-4">
                    {order.deliveryBoy ? (
                      <div>
                        <p className="font-medium">
                          {order.deliveryBoy.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.deliveryBoy.phone}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">
                        Not Assigned
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    <div className="space-y-1">
                      <p>{order.paymentMethod}</p>
                      <p className="text-xs text-gray-500">
                        {order.paymentStatus}
                      </p>
                    </div>
                  </td>

                  <td className="p-4 font-semibold text-sm space-y-1">

                    {/* Subtotal */}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal</span>
                      <span>
                        ₹{
                          order.items.reduce(
                            (sum: number, item: any) =>
                              sum +
                              Number(item.price || 0) *
                              Number(item.quantity || 1),
                            0
                          )
                        }
                      </span>
                    </div>

                    {/* Delivery */}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Delivery</span>
                      <span>₹{Number(order.deliveryCharge || 0)}</span>
                    </div>

                    {/* 🔥 Discount (Only if used) */}
                    {Number(order.discount || 0) > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>
                          Discount
                          {order.couponCode && (
                            <span className="ml-1 text-xs text-gray-500">
                              ({order.couponCode})
                            </span>
                          )}
                        </span>
                        <span>
                          - ₹{Number(order.discount)}
                        </span>
                      </div>
                    )}

                    {/* Final */}
                    <div className="flex justify-between text-[#FF6B00] text-base font-bold border-t pt-1 mt-1">
                      <span>Total</span>
                      <span>₹{Number(order.finalAmount)}</span>
                    </div>

                  </td>

                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${order.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                      order.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                        order.status === "PREPARING" ? "bg-orange-100 text-orange-700" :
                          order.status === "OUT_FOR_DELIVERY" ? "bg-purple-100 text-purple-700" :
                            order.status === "DELIVERED" ? "bg-green-100 text-green-700" :
                              "bg-gray-100"
                      }`}>
                      {order.status}
                    </span>
                  </td>

                  <td className="p-4 text-yellow-600">
                    {order.refundAmount !== null && order.refundAmount !== undefined
                      ? `₹${order.refundAmount}`
                      : "-"}
                  </td>

                  <td className="p-4 text-right space-x-2">

                    {/* 🔥 ADD NEW — STATUS FLOW BUTTONS */}

                    {order.status === "PENDING" && (
                      <button
                        onClick={() => updateStatus(order.id, "CONFIRMED")}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Accept
                      </button>
                    )}

                    {order.status === "CONFIRMED" && (
                      <button
                        onClick={() => updateStatus(order.id, "PREPARING")}
                        className="bg-orange-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Start Preparing
                      </button>
                    )}

                    {order.status === "PREPARING" && (
                      <button
                        onClick={() => updateStatus(order.id, "OUT_FOR_DELIVERY")}
                        className="bg-purple-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Assign & Dispatch
                      </button>
                    )}

                    {["PENDING", "CONFIRMED", "PREPARING"].includes(order.status) && (
                      <button
                        onClick={() => openRefundModal(order.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Cancel
                      </button>
                    )}

                    {/* 🔥 DELETE only after completed states or CANCELLED*/}

                    {["CANCELLED", "DELIVERED"].includes(order.status) && (
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="bg-gray-700 text-white px-3 py-1 rounded text-xs"
                      >
                        Delete
                      </button>
                    )}



                    {order.status === "OUT_FOR_DELIVERY" && (
                      <button
                        onClick={() => router.push(`/user/track/${order.id}`)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Track
                      </button>
                    )}

                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* REFUND MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-80 space-y-3">
            <h2 className="font-semibold">Refund Amount</h2>

            <input
              type="number"
              placeholder="Enter amount"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              className="border p-2 rounded w-full"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="border px-3 py-1 rounded"
              >
                Close
              </button>

              <button
                onClick={handleRefund}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
