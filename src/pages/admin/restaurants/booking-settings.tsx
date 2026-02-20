import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function BookingSettingsAdmin() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(null);

  const [isBookingEnabled, setIsBookingEnabled] = useState(false);
  const [advanceRequired, setAdvanceRequired] = useState(false);
  const [advanceType, setAdvanceType] = useState("PERCENTAGE");
  const [advanceValue, setAdvanceValue] = useState<number | "">("");

  const [loading, setLoading] = useState(false);

  /* ---------------- FETCH RESTAURANTS ---------------- */
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await fetch("/api/admin/restaurants");
      const data = await res.json();
      setRestaurants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- FETCH EXISTING SETTINGS ---------------- */
  useEffect(() => {
    if (!selectedRestaurant) return;
    const fetchSetting = async () => {
      try {
        const res = await fetch(
          `/api/admin/restaurants/?restaurantId=${selectedRestaurant}`
        );

        if (!res.ok) return;

        const data = await res.json();

        if (data) {
          setIsBookingEnabled(data.isBookingEnabled ?? false);
          setAdvanceRequired(data.advanceRequired ?? false);
          setAdvanceType(data.advanceType || "PERCENTAGE");
          setAdvanceValue(data.advanceValue ?? "");
        } else {
          setIsBookingEnabled(false);
          setAdvanceRequired(false);
          setAdvanceType("PERCENTAGE");
          setAdvanceValue("");
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchSetting();
  }, [selectedRestaurant]);



  /* ---------------- SAVE SETTINGS ---------------- */
  /* ---------------- SAVE SETTINGS ---------------- */
  const handleSave = async () => {
    if (!selectedRestaurant) {
      toast.error("Please select restaurant");
      return;
    }

    if (advanceRequired && !advanceValue) {
      toast.error("Enter advance value");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "/api/admin/restaurants/booking-setting",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            restaurantId: Number(selectedRestaurant),
            isBookingEnabled: Boolean(isBookingEnabled),
            advanceRequired: Boolean(advanceRequired),
            advanceType: advanceRequired ? advanceType : null,
            advanceValue: advanceRequired
              ? Number(advanceValue)
              : null,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Booking settings updated");
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <div className="min-h-screen p-6">

        <div className="w-full mx-auto space-y-8">

          {/* ================= TOP FORM CARD ================= */}
          <div className="bg-white rounded-2xl shadow-md p-6">

            <h1 className="text-xl font-semibold mb-6">
              Restaurant Booking Settings
            </h1>

            <div className="grid md:grid-cols-2 gap-6">

              {/* Restaurant Selector */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Select Restaurant
                </label>
                <select
                  value={selectedRestaurant || ""}
                  onChange={(e) =>
                    setSelectedRestaurant(Number(e.target.value))
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Choose Restaurant</option>
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                {!selectedRestaurant && (
                  <p className="text-xs text-gray-500 mt-2">
                    Please select a restaurant to configure booking settings.
                  </p>
                )}
              </div>
            </div>

            {selectedRestaurant && (
              <>
                <div className="grid md:grid-cols-2 gap-6 mt-10">
                  {/* Enable Booking */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-medium">
                      Enable Table Booking
                    </span>
                    <input
                      type="checkbox"
                      checked={isBookingEnabled}
                      onChange={() =>
                        setIsBookingEnabled(!isBookingEnabled)
                      }
                      className="w-5 h-5"
                    />
                  </div>

                  {/* Advance Required */}
                  {isBookingEnabled && (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <span className="font-medium">
                          Require Advance Payment
                        </span>
                        <input
                          type="checkbox"
                          checked={advanceRequired}
                          onChange={() =>
                            setAdvanceRequired(!advanceRequired)
                          }
                          className="w-5 h-5"
                        />
                      </div>

                      {advanceRequired && (
                        <>
                          {/* Advance Type */}
                          <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">
                              Advance Type
                            </label>
                            <select
                              value={advanceType}
                              onChange={(e) =>
                                setAdvanceType(e.target.value)
                              }
                              className="w-full border rounded-xl px-4 py-3"
                            >
                              <option value="PERCENTAGE">
                                Percentage (%)
                              </option>
                              <option value="FLAT">
                                Flat Amount (₹)
                              </option>
                            </select>
                          </div>

                          {/* Advance Value */}
                          <div className="mb-8">
                            <label className="block text-sm font-medium mb-2">
                              Advance Value
                            </label>
                            <input
                              type="number"
                              value={advanceValue}
                              onChange={(e) =>
                                setAdvanceValue(Number(e.target.value))
                              }
                              className="w-full border rounded-xl px-4 py-3"
                            />
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </>
            )}

            <div className="mt-6">
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-[#FF6B00] text-white px-6 py-2 rounded-lg text-sm hover:bg-orange-600 transition"
              >
                {loading ? "Saving..." : "Save Settings"}
              </button>
            </div>

          </div>

          {/* ================= SETTINGS TABLE ================= */}
          <div className="bg-white rounded-2xl shadow-md p-6">

            <h2 className="text-lg font-semibold mb-4">
              Existing Booking Settings
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">

                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="px-4 py-2">Restaurant</th>
                    <th className="px-4 py-2">Booking</th>
                    <th className="px-4 py-2">Advance</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Value</th>
                  </tr>
                </thead>

                <tbody>
                  {restaurants.map((r) => (
                    <tr
                      key={r.id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="px-4 py-2 font-medium">
                        {r.name}
                      </td>

                      <td className="px-4 py-2">
                        {r.bookingSetting?.isBookingEnabled ? (
                          <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
                            Enabled
                          </span>
                        ) : (
                          <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs">
                            Disabled
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-2">
                        {r.bookingSetting?.advanceRequired
                          ? "Yes"
                          : "No"}
                      </td>

                      <td className="px-4 py-2">
                        {r.bookingSetting?.advanceType || "-"}
                      </td>

                      <td className="px-4 py-2">
                        {r.bookingSetting?.advanceValue
                          ? r.bookingSetting.advanceType === "PERCENTAGE"
                            ? `${r.bookingSetting.advanceValue}%`
                            : `₹${r.bookingSetting.advanceValue}`
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
