import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function RestaurantTablesAdmin() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(null);

  const [tables, setTables] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState<number | "">("");
  const [location, setLocation] = useState("INSIDE");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);

  /* ================= FETCH RESTAURANTS ================= */
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    const res = await fetch("/api/admin/restaurants");
    const data = await res.json();
    setRestaurants(Array.isArray(data) ? data : []);
  };

  /* ================= FETCH TABLES ================= */
  useEffect(() => {
    if (!selectedRestaurant) return;
    fetchTables();
  }, [selectedRestaurant]);

  const fetchTables = async () => {
    const res = await fetch(
      `/api/admin/restaurants/tables?restaurantId=${selectedRestaurant}`
    );
    const data = await res.json();
    setTables(Array.isArray(data) ? data : []);
  };

  /* ================= RESET FORM ================= */
  const resetForm = () => {
    setTableNumber("");
    setCapacity("");
    setLocation("INSIDE");
    setIsActive(true);
    setEditingId(null);
  };

  /* ================= SAVE TABLE ================= */
  const handleSave = async () => {
    if (!selectedRestaurant) {
      toast.error("Select restaurant first");
      return;
    }

    if (!tableNumber || !capacity) {
      toast.error("Enter table number & capacity");
      return;
    }

    setLoading(true);

    const method = editingId ? "PUT" : "POST";

    const res = await fetch("/api/admin/restaurants/tables", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingId,
        restaurantId: selectedRestaurant,
        tableNumber,
        capacity: Number(capacity),
        location,
        isActive,
      }),
    });

    if (res.ok) {
      toast.success(editingId ? "Table updated" : "Table created");
      resetForm();
      fetchTables();
    } else {
      const data = await res.json();
      toast.error(data.message || "Error");
    }

    setLoading(false);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id: number) => {
    const res = await fetch(
      `/api/admin/restaurants/tables?id=${id}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      toast.success("Deleted");
      fetchTables();
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (table: any) => {
    setEditingId(table.id);
    setTableNumber(table.tableNumber);
    setCapacity(table.capacity);
    setLocation(table.location);
    setIsActive(table.isActive);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="w-full mx-auto">

        {/* ================= SELECT RESTAURANT ================= */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h1 className="text-xl font-semibold mb-4">
            Restaurant Table Management
          </h1>

          <select
            value={selectedRestaurant || ""}
            onChange={(e) =>
              setSelectedRestaurant(Number(e.target.value))
            }
            className="w-full border rounded-lg px-4 py-2"
          >
            <option value="">Select Restaurant</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* ================= TABLE FORM ================= */}
        {selectedRestaurant && (
          <div className="bg-white p-6 rounded-2xl shadow-md">

            <h2 className="text-lg font-semibold mb-4">
              {editingId ? "Edit Table" : "Add Table"}
            </h2>

            <div className="grid md:grid-cols-4 gap-4">

              <input
                type="text"
                placeholder="Table Number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="border rounded-lg px-4 py-2"
              />

              <input
                type="number"
                placeholder="Capacity"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="border rounded-lg px-4 py-2"
              />

              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border rounded-lg px-4 py-2"
              >
                <option value="INSIDE">Inside</option>
                <option value="OUTSIDE">Outside</option>
              </select>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => setIsActive(!isActive)}
                />
                <span>Active</span>
              </div>

            </div>

            <div className="mt-4 space-x-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg"
              >
                {loading
                  ? "Saving..."
                  : editingId
                  ? "Update"
                  : "Create"}
              </button>

              {editingId && (
                <button
                  onClick={resetForm}
                  className="text-gray-500"
                >
                  Cancel
                </button>
              )}
            </div>

          </div>
        )}

        {/* ================= TABLE LIST ================= */}
        {selectedRestaurant && (
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-lg font-semibold mb-4">
              Existing Tables
            </h2>

            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2">Table</th>
                  <th className="p-2">Capacity</th>
                  <th className="p-2">Location</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>

              <tbody>
                {tables.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="p-2">{t.tableNumber}</td>
                    <td className="p-2">{t.capacity}</td>
                    <td className="p-2">{t.location}</td>
                    <td className="p-2">
                      {t.isActive ? "Active" : "Inactive"}
                    </td>
                    <td className="p-2 space-x-3">
                      <button
                        onClick={() => handleEdit(t)}
                        className="text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </div>
    </div>
  );
}
