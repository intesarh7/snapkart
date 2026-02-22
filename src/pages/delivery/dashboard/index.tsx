import { Phone } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function DeliveryDashboard() {

  const [orders, setOrders] = useState<any[]>([])
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

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



  const fetchOrders = async (pageNumber = 1) => {
    const res = await fetch(`/api/delivery/orders/list?page=${pageNumber}`)
    const data = await res.json()

    if (res.ok) {
      setOrders(data.orders)
      setTotalPages(data.totalPages)
      setPage(data.currentPage)
    }
  }

  useEffect(() => {
    fetchOrders(page)
  }, [page])

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
          className={`px-4 py-2 rounded text-white ${isAvailable
            ? "bg-green-600"
            : "bg-gray-600"
            }`}
        >
          {isAvailable ? "ONLINE" : "OFFLINE"}
        </button>
      </div>

      {/* ================= MOBILE VIEW ================= */}
      <div className="md:hidden space-y-4">
        {orders.map((order: any, index: number) => (
          <div key={order.id} className="bg-white rounded-xl shadow p-4 space-y-2">

            <div className="flex justify-between items-center">
              <div className="font-semibold">
                {index + 1}. {order.orderNumber}
              </div>
              <div className="text-sm font-bold text-orange-600">
                ₹{order.finalAmount}
              </div>
            </div>

            <div className="text-sm">
              <div className="font-medium">{order.user?.name}</div>
              <a
                href={`tel:${order.user?.phone}`}
                className="text-green-600 text-xs flex items-center gap-1"
              >
                <Phone size={14} /> {order.user?.phone}
              </a>
            </div>

            <div className="text-xs text-gray-600">
              {order.items?.map((item: any) => (
                <div key={item.id}>
                  • {item.product?.name} × {item.quantity}
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-500">
              {order.address?.address}, {order.address?.city}
            </div>

            <button
              onClick={() => markDelivered(order.id)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm"
            >
              Mark Delivered
            </button>
          </div>
        ))}
      </div>

      {/* ASSIGNED ORDERS */}
      <div className="hidden md:block bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Items</th>
              <th className="p-4">Address</th>
              <th className="p-4">Restaurant</th>
              <th className="p-4">Amount</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order, index) => (
              <tr key={order.id} className="border-t">

                <td className="p-4">
                  {index + 1}. {order.orderNumber}
                </td>

                <td className="p-4">
                  <div className="font-medium">
                    {order.user?.name}
                  </div>

                  <div className="text-xs text-gray-500 mb-2">
                    {order.user?.phone}
                  </div>

                  {order.user?.phone ? (
                    <a
                      href={`tel:${order.user.phone}`}
                      className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition"
                    >
                      <Phone size={14} />
                      Call
                    </a>
                  ) : (
                    <button
                      disabled
                      className="inline-flex items-center gap-1 bg-gray-400 text-white px-3 py-1 rounded text-xs cursor-not-allowed"
                    >
                      <Phone size={14} />
                      No Phone
                    </button>
                  )}
                </td>
                {/* 🍽 Products */}
                <td className="p-4 text-xs">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="mb-2">

                      {/* Product Name */}
                      <div className="font-medium">
                        • {item.product?.name} × {item.quantity}
                      </div>

                      {/* Variant */}
                      {item.variantName && (
                        <div className="ml-3 text-gray-600">
                          Variant: {item.variantName}
                        </div>
                      )}

                      {/* Extras */}
                      {item.extras?.length > 0 && (
                        <div className="ml-3 text-gray-600">
                          Extras:
                          {item.extras.map((ex: any, i: number) => (
                            <div key={i} className="ml-2">
                              + {ex.name}
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  ))}
                </td>

                {/* 📍 Address */}
                <td className="p-4 text-xs">
                  <div>
                    {order.address?.address}
                  </div>
                  <div>
                    {order.address?.city}, {order.address?.state}
                  </div>
                  <div>
                    {order.address?.pincode}
                  </div>
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

      {/* ================= PAGINATION ================= */}
      <div className="flex justify-center mt-6 gap-2">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span className="px-4 py-2 text-sm">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
