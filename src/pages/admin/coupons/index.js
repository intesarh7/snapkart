import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    code: "",
    type: "PERCENTAGE",
    value: "",
    isActive: true,
    expiresAt: ""
  });

  /* ---------------- FETCH COUPONS ---------------- */

  const fetchCoupons = async () => {
    const res = await fetch("/api/admin/coupons", {
      credentials: "include"
    });

    if (!res.ok) {
      setCoupons([]);
      return;
    }

    const data = await res.json();
    setCoupons(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  /* ---------------- RESET FORM ---------------- */

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      code: "",
      type: "PERCENTAGE",
      value: "",
      isActive: true,
      expiresAt: "",
      usageLimit: "",
        oneTimePerUser: false
    });
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `/api/admin/coupons/${editId}`
      : "/api/admin/coupons";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form)
    });

    setShowModal(false);
    setEditId(null);
    resetForm();
    fetchCoupons();
  };

  /* ---------------- EDIT ---------------- */

  const handleEdit = (coupon) => {
    setForm({
      ...coupon,
      expiresAt: coupon.expiresAt
        ? new Date(coupon.expiresAt).toISOString().slice(0, 16)
        : ""
    });
    setEditId(coupon.id);
    setShowModal(true);
  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = async (id) => {
    if (!confirm("Delete this coupon?")) return;

    await fetch(`/api/admin/coupons/${id}`, {
      method: "DELETE",
      credentials: "include"
    });

    fetchCoupons();
  };

  return (
    <>
      <div className="p-6">

        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">Coupon Management</h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Add Coupon
          </button>
        </div>

        {/* ---------------- TABLE ---------------- */}

        <table className="w-full bg-white shadow rounded-lg">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-3">Title</th>
              <th>Code</th>
              <th>Type</th>
              <th>Useges</th>
              <th>Value</th>
              <th>Active</th>
              <th>Expiry</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody className="text-center">
            {Array.isArray(coupons) && coupons.length > 0 ? (
              coupons.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="p-3">{c.title}</td>
                  <td className="font-semibold">{c.code}</td>
                  <td className="font-semibold">
                    {c.usageLimit
                        ? `${c.usedCount} / ${c.usageLimit}`
                        : `${c.usedCount} / Unlimited`}
                    </td>
                  <td>{c.type}</td>
                  <td>
                    {c.type === "PERCENTAGE"
                      ? `${c.value}%`
                      : `₹ ${c.value}`}
                  </td>
                  <td>{c.isActive ? "Yes" : "No"}</td>
                  <td>
                    {c.expiresAt
                      ? new Date(c.expiresAt).toLocaleString()
                      : "No Expiry"}
                  </td>
                  <td className="space-x-3">
                    <button onClick={() => handleEdit(c)}>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  No coupons found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ---------------- MODAL ---------------- */}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded w-96 space-y-3"
            >
              <input
                placeholder="Title"
                className="border w-full p-2"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />

              <textarea
                placeholder="Description"
                className="border w-full p-2"
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <input
                placeholder="Coupon Code"
                className="border w-full p-2 uppercase"
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
              />

              <select
                className="border w-full p-2"
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value })
                }
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FLAT">Flat</option>
              </select>

              <input
                type="number"
                placeholder="Value"
                className="border w-full p-2"
                value={form.value}
                onChange={(e) =>
                  setForm({ ...form, value: e.target.value })
                }
              />

              <input
                type="datetime-local"
                className="border w-full p-2"
                value={form.expiresAt || ""}
                onChange={(e) =>
                  setForm({ ...form, expiresAt: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Usage Limit (optional)"
                className="border w-full p-2"
                value={form.usageLimit}
                onChange={(e) =>
                    setForm({ ...form, usageLimit: e.target.value })
                }
                />

                <label>
                <input
                    type="checkbox"
                    checked={form.oneTimePerUser}
                    onChange={(e) =>
                    setForm({ ...form, oneTimePerUser: e.target.checked })
                    }
                /> One Time Per User
                </label>

              <label>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                /> Active
              </label>

              <button className="bg-black text-white w-full py-2 rounded">
                Save Coupon
              </button>
            </form>
          </div>
        )}

      </div>
    </>
  );
}
