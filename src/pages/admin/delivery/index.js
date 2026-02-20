import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function DeliveryRules() {
  const [rules, setRules] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

 const [form, setForm] = useState({
  title: "",
  restaurantId: "",
  minOrder: "",
  maxOrder: "",
  minDistance: "",
  maxDistance: "",
  chargeType: "FREE",
  chargeAmount: "",
  baseDistance: "",
  perKmCharge: "",
  isActive: true
});

  /* -------- FETCH DATA -------- */

  const fetchData = async () => {
    try {
      const r1 = await fetch("/api/admin/delivery", { credentials: "include" });
      const r2 = await fetch("/api/admin/restaurants/get", { credentials: "include" });

      const rulesData = r1.ok ? await r1.json() : [];
      const restData = r2.ok ? await r2.json() : [];

      setRules(Array.isArray(rulesData) ? rulesData : []);
      setRestaurants(
        Array.isArray(restData.restaurants) ? restData.restaurants : []
      );

    } catch (error) {
      console.error("Fetch error:", error);
      setRules([]);
      setRestaurants([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* -------- SUBMIT -------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.restaurantId) {
      setErrorMessage("Please select restaurant");
      return;
    }

    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `/api/admin/delivery/${editId}`
      : "/api/admin/delivery";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
  ...form,
  restaurantId: Number(form.restaurantId),
  minOrder: Number(form.minOrder),
  maxOrder: form.maxOrder ? Number(form.maxOrder) : null,
  minDistance: Number(form.minDistance),
  maxDistance: form.maxDistance ? Number(form.maxDistance) : null,
  chargeAmount: form.chargeType === "FREE" ? 0 : Number(form.chargeAmount),
  baseDistance: form.baseDistance ? Number(form.baseDistance) : null,
  perKmCharge: form.perKmCharge ? Number(form.perKmCharge) : null
})

    });

    setShowModal(false);
    setEditId(null);
    setErrorMessage("");

    setForm({
      title: "",
      restaurantId: "",
      minOrder: "",
      maxOrder: "",
      minDistance: "",
      maxDistance: "",
      chargeType: "FREE",
      chargeAmount: "",
      isActive: true
    });

    fetchData();
  };

  /* -------- EDIT -------- */

  const handleEdit = (rule) => {
    setForm({
      title: rule.title,
      restaurantId: rule.restaurantId?.toString() || "",
      minOrder: rule.minOrder?.toString() || "",
      maxOrder: rule.maxOrder?.toString() || "",
      minDistance: rule.minDistance?.toString() || "",
      maxDistance: rule.maxDistance?.toString() || "",
      chargeType: rule.chargeType,
      chargeAmount: rule.chargeAmount?.toString() || "",
      baseDistance: rule.baseDistance?.toString() || "",
perKmCharge: rule.perKmCharge?.toString() || "",
      isActive: rule.isActive
    });

    setEditId(rule.id);
    setShowModal(true);
  };

  /* -------- DELETE -------- */

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    await fetch(`/api/admin/delivery/${deleteId}`, {
      method: "DELETE",
      credentials: "include"
    });

    setShowDeleteModal(false);
    setDeleteId(null);
    fetchData();
  };

  return (
    <>
      <div className="p-6">

        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">Delivery Rules</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Add Rule
          </button>
        </div>

        <table className="w-full bg-white shadow rounded-lg text-center">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-2">Title</th>
              <th>Restaurant</th>
              <th>Order Range</th>
              <th>Distance</th>
              <th>Charge</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {rules.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-2">{r.title}</td>
                <td>{r.restaurant?.name || "—"}</td>
                <td>{r.minOrder} - {r.maxOrder || "∞"}</td>
                <td>
  {r.chargeType === "FREE"
    ? "Free"
    : `₹ ${r.chargeAmount} + ₹${r.perKmCharge || 0}/km after ${r.baseDistance || 0}km`}
</td>
                <td>
                  {r.chargeType === "FREE"
                    ? "Free"
                    : `₹ ${r.chargeAmount}`}
                </td>
                <td>{r.isActive ? "Active" : "Inactive"}</td>
                <td className="space-x-2">
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => handleEdit(r)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => handleDelete(r.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* -------- ADD / EDIT MODAL -------- */}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-96 shadow-xl relative">

              {/* Close Button */}
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditId(null);
                  setErrorMessage("");
                }}
                className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
              >
                ✕
              </button>

              <form
                onSubmit={handleSubmit}
                className="p-6 space-y-3"
              >
                <h2 className="text-lg font-semibold">
                  {editId ? "Edit Rule" : "Add Rule"}
                </h2>

                {errorMessage && (
                  <div className="bg-red-100 text-red-600 px-3 py-2 rounded text-sm">
                    {errorMessage}
                  </div>
                )}

                <input
                  placeholder="Rule Title"
                  className="border w-full p-2 rounded"
                  value={form.title}
                  onChange={(e)=>setForm({...form,title:e.target.value})}
                />

                <select
                  className="border w-full p-2 rounded"
                  value={form.restaurantId}
                  onChange={(e)=>setForm({...form,restaurantId:e.target.value})}
                >
                  <option value="">Select Restaurant</option>
                  {restaurants.map((r)=>(
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>

                <input type="number" placeholder="Min Order"
                  className="border w-full p-2 rounded"
                  value={form.minOrder}
                  onChange={(e)=>setForm({...form,minOrder:e.target.value})}
                />

                <input type="number" placeholder="Max Order"
                  className="border w-full p-2 rounded"
                  value={form.maxOrder || ""}
                  onChange={(e)=>setForm({...form,maxOrder:e.target.value})}
                />

                <input type="number" placeholder="Min Distance"
                  className="border w-full p-2 rounded"
                  value={form.minDistance}
                  onChange={(e)=>setForm({...form,minDistance:e.target.value})}
                />

                <input type="number" placeholder="Max Distance"
                  className="border w-full p-2 rounded"
                  value={form.maxDistance || ""}
                  onChange={(e)=>setForm({...form,maxDistance:e.target.value})}
                />

                <select
                  className="border w-full p-2 rounded"
                  value={form.chargeType}
                  onChange={(e)=>setForm({...form,chargeType:e.target.value})}
                >
                  <option value="FREE">Free</option>
                  <option value="FLAT">Flat</option>
                </select>

                {form.chargeType === "FLAT" && (
                  <input
                    type="number"
                    placeholder="Charge Amount"
                    className="border w-full p-2 rounded"
                    value={form.chargeAmount}
                    onChange={(e)=>setForm({...form,chargeAmount:e.target.value})}
                  />
                )}

                <input
  type="number"
  placeholder="Base Distance (km)"
  className="border w-full p-2 rounded"
  value={form.baseDistance}
  onChange={(e)=>setForm({...form,baseDistance:e.target.value})}
/>

<input
  type="number"
  placeholder="Per KM Charge"
  className="border w-full p-2 rounded"
  value={form.perKmCharge}
  onChange={(e)=>setForm({...form,perKmCharge:e.target.value})}
/>

                <label className="flex items-center gap-2">
                  <input type="checkbox"
                    checked={form.isActive}
                    onChange={(e)=>setForm({...form,isActive:e.target.checked})}
                  />
                  Active
                </label>

                <button className="bg-black text-white w-full py-2 rounded hover:bg-gray-800 transition">
                  {editId ? "Update Rule" : "Save Rule"}
                </button>
                
              </form>
            </div>
          </div>
        )}

        {/* -------- DELETE CONFIRM MODAL -------- */}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-80 p-6 shadow-xl relative">

              <button
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
              >
                ✕
              </button>

              <h2 className="text-lg font-semibold mb-4">
                Confirm Delete
              </h2>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this rule?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
