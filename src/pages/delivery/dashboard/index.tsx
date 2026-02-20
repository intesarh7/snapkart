import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function DeliveryDashboard() {

  const [orders, setOrders] = useState<any[]>([])
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    fetchOrders()
    fetchProfile()
  }, [])

  // 🔥 ADD NEW — AUTO LOCATION PUSH EVERY 10 SECONDS
useEffect(() => {

  const interval = setInterval(() => {

    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition(async (pos) => {

        await fetch("/api/delivery/location/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          })
        })

      })

    }

  }, 5000)

  return () => clearInterval(interval)

}, [])


  const fetchOrders = async () => {
    const res = await fetch("/api/delivery/orders/list")
    const data = await res.json()
    if (res.ok) setOrders(data.orders)
  }

const fetchProfile = async (isMountedRef?: { current: boolean }) => {
  try {
    const res = await fetch("/api/auth/me", {
      credentials: "include",
    });

    if (isMountedRef && !isMountedRef.current) return;

    // 🔐 Not logged in (normal case)
    if (res.status === 401) {
      setIsAvailable(false);
      return;
    }

    // ⚠️ Server error
    if (!res.ok) {
      console.error("Profile fetch failed:", res.status);
      setIsAvailable(false);
      return;
    }

    const data = await res.json();

    if (isMountedRef && !isMountedRef.current) return;

    setIsAvailable(!!data?.user?.isAvailable);

  } catch (error) {
    console.error("Profile fetch error:", error);
    setIsAvailable(false);
  }
};
useEffect(() => {
  const isMountedRef = { current: true };

  fetchProfile(isMountedRef);

  return () => {
    isMountedRef.current = false;
  };
}, []);

  const toggleAvailability = async () => {
    const res = await fetch("/api/delivery/toggle-availability", {
      method: "POST"
    })
    const data = await res.json()

    if (res.ok) {
      toast.success(data.message)
      setIsAvailable(data.isAvailable)
    } else {
      toast.error(data.message)
    }
  }

  const markDelivered = async (orderId: number) => {

    const res = await fetch("/api/delivery/orders/delivered", {
      method: "POST",
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

  return (
    <div className="mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        Delivery Dashboard
      </h1>

      {/* ONLINE / OFFLINE TOGGLE */}
      <div className="mb-6">
        <button
          onClick={toggleAvailability}
          className={`px-4 py-2 rounded text-white ${
            isAvailable
              ? "bg-green-600"
              : "bg-gray-600"
          }`}
        >
          {isAvailable ? "ONLINE" : "OFFLINE"}
        </button>
      </div>

      {/* ASSIGNED ORDERS */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Address</th>
              <th className="p-4">Restaurant</th>
              <th className="p-4">Amount</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-t">

                <td className="p-4">
                  #{order.orderNumber}
                </td>

                <td className="p-4">
                  {order.user?.name}
                </td>

                <td className="p-4 text-xs">
                  {order.address?.address}, {order.address?.city}
                </td>

                <td className="p-4">
                  {order.restaurant?.name}
                </td>

                <td className="p-4 font-semibold">
                  ₹{order.finalAmount}
                </td>

                <td className="p-4 text-right">
                  <button
                    onClick={() => markDelivered(order.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                  >
                    Mark Delivered
                  </button>
                </td>

              </tr>
            ))}

            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No active deliveries
                </td>
              </tr>
            )}

          </tbody>
        </table>
      </div>

    </div>
  )
}
