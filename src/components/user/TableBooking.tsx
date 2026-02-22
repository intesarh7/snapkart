"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface Props {
  restaurantId: number;
  onClose: () => void;
}

export default function TableBooking({ restaurantId, onClose }: Props) {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [guests, setGuests] = useState(1);
  const [location, setLocation] = useState("INSIDE");
  const [tables, setTables] = useState<any[]>([]);
  const formatPrice = (amount: number) => Math.round(amount);

  const [selectedTable, setSelectedTable] = useState("");
  const [specialNote, setSpecialNote] = useState("");

  const [preOrderProducts, setPreOrderProducts] = useState<any[]>([]);

  // 🔥 Fetch restaurant
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`/api/user/restaurants/${restaurantId}`);
        const data = await res.json();
        setRestaurant(data);
        setTables(data?.tables || []);
      } catch {
        toast.error("Failed to load restaurant");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [restaurantId]);

  // ESC close
  useEffect(() => {
    const handleEsc = (e: any) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Preorder logic
  const toggleProduct = (product: any) => {
    const exists = preOrderProducts.find(
      (item) => item.productId === product.id
    );

    if (exists) return;

    setPreOrderProducts([
      ...preOrderProducts,
      { productId: product.id, quantity: 1, price: product.finalPrice },
    ]);
  };

  const updateQuantity = (id: string, type: "inc" | "dec") => {
    setPreOrderProducts((prev) =>
      prev.map((item) =>
        item.productId === id
          ? {
            ...item,
            quantity:
              type === "inc"
                ? item.quantity + 1
                : Math.max(1, item.quantity - 1),
          }
          : item
      )
    );
  };

  const removePreOrderItem = (id: string) => {
    setPreOrderProducts((prev) =>
      prev.filter((item) => item.productId !== id)
    );
  };

  const preOrderTotal = preOrderProducts.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

   const advanceAmount =
    restaurant?.bookingSetting?.advanceValue || 0;

  const totalPayable = preOrderTotal + advanceAmount;

  const handleBooking = async () => {
    if (!bookingDate || !bookingTime) {
      toast.error("Please select date & time");
      return;
    }

    if (!selectedTable) {
      toast.error("Please select a table");
      return;
    }

    try {
      const res = await fetch("/api/user/table-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          tableId: selectedTable,
          bookingDate,
          bookingTime,
          guests,
          location,
          specialNote,
          preOrderedProducts: preOrderProducts.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      if (res.ok) {
        toast.success("Booking request sent");
        onClose();
      } else {
        toast.error("Booking failed");
      }
    } catch {
      toast.error("Server error");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 text-white">
        Loading...
      </div>
    );
  }

  if (!restaurant) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl p-6 relative overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500"
        >
          ✕
        </button>

        <div className="flex items-center gap-4 mb-6 border-b pb-4">
          <img
            src={restaurant?.image || "/placeholder.jpg"}
            className="w-16 h-16 rounded-xl object-cover"
          />

          <div>
            <h2 className="text-xl font-semibold">
              {restaurant?.name}
            </h2>

            <p className="text-sm text-gray-500">
              {restaurant?.address}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Date</label>
            <input
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Time</label>
            <input
              type="time"
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Guests</label>
            <input
              type="number"
              min="1"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Seating</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="INSIDE">Inside</option>
              <option value="OUTSIDE">Outside</option>
            </select>
          </div>
        </div>

        {/* Tables */}
        <div className="mt-6">
          <label className="text-sm font-medium">Select Table</label>

          <div className="grid grid-cols-3 gap-3 mt-2">
            {tables
              .filter((t) => t.location === location)
              .map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTable(t.id)}
                  className={`border rounded-lg py-2 text-sm transition ${selectedTable === t.id
                    ? "bg-[#FF6B00] text-white"
                    : "hover:bg-gray-100"
                    }`}
                >
                  Table {t.tableNumber}
                  <div className="text-xs text-gray-500">
                    {t.capacity} seats
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* Pre Order */}
        <div className="mt-6">
          <label className="text-sm font-medium">
            Pre-order Dishes (Optional)
          </label>

          <div className="space-y-3 mt-3">
            {restaurant?.products?.map((p: any) => {
              const selected = preOrderProducts.find(
                (item) => item.productId === p.id
              );

              return (
                <div
                  key={p.id}
                  className="border rounded-xl p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500">
                      ₹{p.finalPrice}
                    </p>
                  </div>

                  {!selected ? (
                    <button
                      onClick={() => toggleProduct(p)}
                      className="bg-[#FF6B00] text-white px-3 py-1 rounded-lg text-xs"
                    >
                      Add
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(p.id, "dec")}
                        className="px-2 py-1 border rounded"
                      >
                        -
                      </button>

                      <span>{selected.quantity}</span>

                      <button
                        onClick={() => updateQuantity(p.id, "inc")}
                        className="px-2 py-1 border rounded"
                      >
                        +
                      </button>

                      <button
                        onClick={() => removePreOrderItem(p.id)}
                        className="text-red-500 text-xs ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 bg-orange-50 p-4 rounded-xl space-y-2 text-sm">

          <div className="flex justify-between">
            <span>Pre-order Total</span>
            <span>₹{formatPrice(preOrderTotal)}</span>
          </div>

          {advanceAmount > 0 && (
            <div className="flex justify-between">
              <span>Advance Booking Amount</span>
              <span>₹{advanceAmount}</span>
            </div>
          )}

          <div className="flex justify-between font-semibold text-[#FF6B00]">
            <span>Total Payable</span>
            <span>₹{formatPrice(totalPayable)}</span>
          </div>

        </div>

        <button
          onClick={handleBooking}
          className="w-full mt-6 bg-[#FF6B00] text-white py-3 rounded-lg"
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
}
