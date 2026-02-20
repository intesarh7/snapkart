import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    const res = await fetch("/api/admin/bookings");
    const data = await res.json();
    setBookings(data);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    const res = await fetch("/api/admin/bookings/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: id, status }),
    });

    if (res.ok) {
      toast.success("Booking updated");
      fetchBookings();
    } else {
      toast.error("Update failed");
    }
  };

  return (
    <div className="w-full mx-auto">

      <h1 className="text-2xl font-semibold mb-6">
        Table Bookings
      </h1>

      <div className="space-y-4">

        {bookings.map((b: any) => (
          <div
            key={b.id}
            className="bg-white shadow rounded-xl p-5 flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold text-lg">
                {b.restaurant.name}
              </h3>

              <p className="text-sm text-gray-500">
                {new Date(b.bookingDate).toDateString()} | {b.bookingTime}
              </p>

              <p className="text-sm">
                Guests: {b.guests}
              </p>

              <p className="text-sm">
                User: {b.user.name}
              </p>

              {/* 🔥 Pre Ordered Items */}
              {b.preOrderedProducts?.length > 0 && (
                <div className="mt-3 bg-orange-50 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-orange-600 mb-2">
                    Pre-Ordered Dishes:
                  </p>

                  <div className="space-y-1">
                    {b.preOrderedProducts.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <span>
                          {item.product?.name}
                        </span>

                        <span className="text-gray-600">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">

              {b.status === "PENDING" && (
                <>
                  <button
                    onClick={() =>
                      updateStatus(b.id, "AWAITING_PAYMENT")
                    }
                    className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(b.id, "REJECTED")
                    }
                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Reject
                  </button>
                </>
              )}

              {b.status === "AWAITING_PAYMENT" && (
                <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-xs">
                  Awaiting Payment
                </span>
              )}

              {b.status === "CONFIRMED" && (
                <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs">
                  Confirmed
                </span>
              )}

            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
