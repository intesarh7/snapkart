import { useEffect, useState } from "react";
 
export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "PERCENTAGE",
    value: "",
    isPopup: false,
    expiresAt: "",
    isMarquee: false,
    isActive: true
  });

  const fetchOffers = async () => {
    const res = await fetch("/api/admin/offers", {
      method: "GET",
      credentials: "include"   // ⭐ VERY IMPORTANT
    });

    if (!res.ok) {
      setOffers([]);
      return;
    }

    const data = await res.json();
    setOffers(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      type: "PERCENTAGE",
      value: "",
      isPopup: false,
      isMarquee: false,
      isActive: true,
      expiresAt: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `/api/admin/offers/${editId}`
      : "/api/admin/offers";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form)
    });

    setShowModal(false);
    setEditId(null);
    resetForm();
    fetchOffers();
  };

  const handleEdit = (offer) => {
    setForm(offer);
    setEditId(offer.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this offer?")) return;

    await fetch(`/api/admin/offers/${id}`, {
      method: "DELETE",
      credentials: "include"
    });

    fetchOffers();
  };

  return (
    <>
      <div className="p-6">

        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">Offer Management</h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Add Offer
          </button>
        </div>

        <table className="w-full bg-white shadow rounded-lg">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-3 text-left">Title</th>
              <th>Type</th>
              <th>Value</th>
              <th>Popup</th>
              <th>Marquee</th>
              <th>Active</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(offers) && offers.length > 0 ? (
              offers.map((o) => (
                <tr key={o.id} className="border-b">
                  <td className="p-3">{o.title}</td>
                  <td>{o.type}</td>
                  <td>
                    {o.type === "PERCENTAGE"
                      ? `${o.value}%`
                      : `₹ ${o.value}`}
                  </td>
                  <td>{o.isPopup ? "Yes" : "No"}</td>
                  <td>{o.isMarquee ? "Yes" : "No"}</td>
                  <td>{o.isActive ? "Yes" : "No"}</td>
                  <td className="space-x-3">
                    <button onClick={() => handleEdit(o)}>Edit</button>
                    <button
                      onClick={() => handleDelete(o.id)}
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
                  No offers found
                </td>
              </tr>
            )}
          </tbody>

        </table>

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

              <label>
                <input
                  type="checkbox"
                  checked={form.isPopup}
                  onChange={(e) =>
                    setForm({ ...form, isPopup: e.target.checked })
                  }
                /> Show in Popup
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={form.isMarquee}
                  onChange={(e) =>
                    setForm({ ...form, isMarquee: e.target.checked })
                  }
                /> Show in Marquee
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
                Save Offer
              </button>
            </form>
          </div>
        )}

      </div>
    </>
  );
}
