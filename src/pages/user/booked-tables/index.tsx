import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Seo from "@/components/Seo";

export default function MyBookedTables() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [payingId, setPayingId] = useState<number | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/user/my-bookings");

      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load bookings");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  /* ================= PAYMENT HANDLER ================= */

  const handlePayAdvance = async (booking: any) => {
    try {
      setPayingId(booking.id);

      /* ================= ADD START ================= */

      // 🔥 Pre-order total calculate
      const preOrderTotal =
        booking.preOrderedProducts?.reduce(
          (sum: number, item: any) =>
            sum +
            item.quantity *
            (item.product?.finalPrice || 0),
          0
        ) || 0;

      // 🔥 Advance amount
      const advanceAmount = booking.advanceAmount || 0;

      // 🔥 Final combined amount
      const totalAmount = advanceAmount + preOrderTotal;

      /* ================= ADD END ================= */

      const res = await fetch("/api/user/create-payment-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "BOOKING",
          referenceId: booking.id,
          amount: totalAmount, // ✅ FIXED (was booking.advanceAmount)
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.paymentSessionId) {
        toast.error(data.message || "Payment failed");
        return;
      }

      const cashfree = (window as any).Cashfree({
        mode: "production",
      });

      cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        redirectTarget: "_self",
      });

    } catch (error) {
      console.error(error);
      toast.error("Server error");
    } finally {
      setPayingId(null);
    }
  };




  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "AWAITING_PAYMENT":
        return "bg-blue-100 text-blue-700";
      case "CONFIRMED":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      case "CANCELLED":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <>
      <Seo
        title="My Table Bookings | SnapKart"
        description="View and manage your restaurant table bookings on SnapKart."
        url="https://yourdomain.com/user/booked-tables"
      />

      {/* 🔒 Prevent Indexing */}
      <meta name="robots" content="noindex,nofollow" />
      <div className="min-h-screen bg-linear-to-b from-orange-50 to-white pb-5">
        {/* ===== Small Header Section ===== */}
        <div className="mb-10">
          <div className="bg-linear-to-r from-orange-500 to-orange-600 h-60 flex flex-col justify-end  py-8 px-6 text-center shadow-lg relative overflow-hidden">

            {/* Soft background glow */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white,transparent_70%)]"></div>

            <h1 className="text-2xl md:text-3xl font-bold text-white relative z-10">
              My Table Bookings
            </h1>

            <p className="text-orange-100 mt-2 text-sm md:text-base relative z-10">
              View, manage your restaurant table reservations and payments
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-3">

          {/* Empty State */}
          {bookings.length === 0 && (
            <div className="bg-white rounded-2xl p-10 text-center shadow-lg border border-orange-100">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-2xl">
                🍽️
              </div>
              <p className="text-gray-600 font-medium">
                No bookings found
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Start exploring restaurants and reserve your table.
              </p>
            </div>
          )}

          {/* Booking List */}
          <div className="space-y-6">

            {bookings.map((b: any) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">

                  {/* LEFT SIDE */}
                  <div className="space-y-2">

                    <h3 className="text-xl font-semibold text-gray-800">
                      {b.restaurant.name}
                    </h3>

                    <div className="text-sm text-gray-500">
                      {new Date(b.bookingDate).toDateString()} • {b.bookingTime}
                    </div>

                    <div className="text-sm text-gray-600">
                      Guests: <span className="font-medium">{b.guests}</span>
                    </div>

                    {/* 🔥 PRE ORDER ITEMS */}
                    {b.preOrderedProducts?.length > 0 && (
                      <div className="mt-3 bg-orange-50 p-4 rounded-xl space-y-2">

                        <p className="text-xs font-semibold text-orange-600">
                          Pre-Ordered Dishes:
                        </p>

                        {b.preOrderedProducts.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {item.product?.name} × {item.quantity}
                            </span>

                            <span>
                              ₹{item.quantity * item.product?.finalPrice}
                            </span>
                          </div>
                        ))}

                      </div>
                    )}

                    {/* 🔥 PAYMENT BREAKDOWN */}
                    {(b.status === "AWAITING_PAYMENT") && (
                      <div className="mt-3 bg-gray-50 p-4 rounded-xl text-sm space-y-2">

                        <div className="flex justify-between">
                          <span>Advance Booking Amount</span>
                          <span>₹{b.advanceAmount || 0}</span>
                        </div>

                        {b.preOrderedProducts?.length > 0 && (
                          <div className="flex justify-between">
                            <span>Pre-order Amount</span>
                            <span>
                              ₹{
                                Math.round(
                                  b.preOrderedProducts.reduce(
                                    (sum: number, item: any) =>
                                      sum + item.quantity * item.product?.finalPrice,
                                    0
                                  )
                                )
                              }
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between font-semibold text-orange-600">
                          <span>Total Payable</span>
                          <span>
                            ₹{
                              Math.round(
                                (b.advanceAmount || 0) +
                                (b.preOrderedProducts?.reduce(
                                  (sum: number, item: any) =>
                                    sum + item.quantity * item.product?.finalPrice,
                                  0
                                ) || 0)
                              )
                            }
                          </span>
                        </div>

                      </div>
                    )}

                  </div>

                  {/* RIGHT SIDE */}
                  <div className="flex flex-col items-start md:items-end gap-3">

                    {/* Status Badge */}
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide ${getStatusBadge(
                        b.status
                      )}`}
                    >
                      {b.status.replace("_", " ")}
                    </span>

                    {/* Pay Button */}
                    {b.status === "AWAITING_PAYMENT" &&
                      !b.isAdvancePaid && (
                        <button
                          onClick={() => handlePayAdvance(b)}
                          disabled={payingId === b.id}
                          className="bg-linear-to-r from-orange-500 to-orange-600 text-white px-5 py-2 rounded-xl text-sm font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-60"
                        >
                          {payingId === b.id
                            ? "Processing..."
                            : "Pay Advance"}
                        </button>
                      )}

                    {b.status === "CONFIRMED" && (
                      <div className="text-green-600 text-sm font-medium bg-green-50 px-4 py-1 rounded-full">
                        ✔ Payment Completed
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
    </>
  );
}
