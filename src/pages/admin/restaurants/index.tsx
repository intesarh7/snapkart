import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function RestaurantsPage() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [existingImage, setExistingImage] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    isActive: true,
    isOpen: true,
    openTime: "",
    closeTime: "",
    rating: "",
    deliveryTime: "",
    addOffer: "",
    image: null as File | null,
  });


  // FETCH RESTAURANTS
  const fetchRestaurants = async () => {
    try {
      const res = await fetch("/api/admin/restaurants/get", {
        credentials: "include"
      });

      if (!res.ok) {
        console.error("Restaurant API error:", res.status);
        setRestaurants([]);
        return;
      }

      const data = await res.json();

      setRestaurants(
        Array.isArray(data)
          ? data
          : Array.isArray(data.restaurants)
            ? data.restaurants
            : []
      );

    } catch (err) {
      console.error("Fetch error:", err);
      setRestaurants([]);
    }
  };


  useEffect(() => {
    fetchRestaurants();
  }, []);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm({
            ...form,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          });
        },
        () => {
          setMessage("Location permission denied ❌");
        }
      );
    }
  };


  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");

    const url = editingId
      ? `/api/admin/restaurants/update?id=${editingId}`
      : "/api/admin/restaurants/create";

    const method = editingId ? "PUT" : "POST";

    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("address", form.address);
    formData.append("latitude", form.latitude);
    formData.append("longitude", form.longitude);
    formData.append("isActive", String(form.isActive));
    formData.append("isOpen", String(form.isOpen));
    formData.append("openTime", form.openTime);
    formData.append("closeTime", form.closeTime);
    formData.append("rating", form.rating);
    formData.append("deliveryTime", form.deliveryTime);
    formData.append("addOffer", form.addOffer);


    if (form.image) {
      formData.append("image", form.image);
    }

    const res = await fetch(url, {
      method,
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      setMessage(
        editingId
          ? "Restaurant Updated Successfully ✅"
          : "Restaurant Created Successfully ✅"
      );

      setForm({
        name: "",
        address: "",
        latitude: "",
        longitude: "",
        isActive: true,
        isOpen: true,
        openTime: "",
        closeTime: "",
        rating: "",
        deliveryTime: "",
        addOffer: "",
        image: null as File | null,
      });

      setEditingId(null);
      setShowModal(false);
      fetchRestaurants();
    } else {
      setMessage(data.message);
    }

    setLoading(false);
  };

  const handleEdit = (rest: any) => {
    setEditingId(rest.id);
    setForm({
      name: rest.name,
      address: rest.address,
      latitude: rest.latitude.toString(),
      longitude: rest.longitude.toString(),
      isActive: rest.isActive,
      isOpen: rest.isOpen,
      image: null as File | null,
      openTime: rest.openTime || "",
      closeTime: rest.closeTime || "",
      rating: rest.rating ? rest.rating.toString() : "",
      deliveryTime: rest.deliveryTime || "",
      addOffer: rest.addOffer || "",

    });
    setExistingImage(rest.image || null);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    await fetch(`/api/admin/restaurants/delete?id=${deleteId}`, {
      method: "DELETE",
    });

    setShowDeleteModal(false);
    setExistingImage(null);
    setDeleteId(null);
    fetchRestaurants();
    setMessage("Restaurant Deleted Successfully ✅");
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Restaurants</h2>

        <button
          onClick={() => {
            setEditingId(null);
            setShowModal(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          + Add Restaurant
        </button>
      </div>

      {/* LIST TABLE */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Categories</th>
              <th className="p-3">Address</th>
              <th className="p-3">Image</th>
              <th className="p-3">Active</th>
              <th className="p-3">Open</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((rest) => (
              <tr key={rest.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{rest.name}</td>
                <td className="p-3">
                  {rest.categories && rest.categories.length > 0
                    ? rest.categories.map((c: any) => c.name).join(", ")
                    : "—"}
                </td>
                <td className="p-3">{rest.address}</td>
                <td className="p-3">
                  {rest.image ? (
                    <img
                      src={rest.image}
                      alt={rest.name}
                      className="w-14 h-14 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-14 h-14 flex items-center justify-center bg-gray-200 rounded-lg text-xs text-gray-500">
                      No Image
                    </div>
                  )}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${rest.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                      }`}
                  >
                    {rest.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${rest.isOpen
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-200 text-gray-700"
                      }`}
                  >
                    {rest.isOpen ? "Open" : "Closed"}
                  </span>
                </td>
                <td className="p-3 text-right space-x-2">
                  <button
                    onClick={() => handleEdit(rest)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(rest.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>



      {/* Modal (Your Original Code Ke Sath) */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
          onClick={() => setShowModal(false)} // 🔥 OUTSIDE CLICK CLOSE
        >
          <div
            className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 relative"
            onClick={(e) => e.stopPropagation()} // 🔥 Prevent inner close
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-3 text-gray-500"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold mb-4">
              {editingId ? "Edit Restaurant" : "Create Restaurant"}
            </h3>

            {message && (
              <div className="mb-3 p-2 bg-green-50 text-green-700 text-sm rounded">
                {message}
              </div>
            )}

            <div className="space-y-3">

              {/* EXISTING FIELDS */}
              <input
                value={form.name}
                placeholder="Restaurant Name"
                className="w-full border p-2 rounded-lg"
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />

              <input
                value={form.address}
                placeholder="Address"
                className="w-full border p-2 rounded-lg"
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
              />

              {/* 🔥 NEW FIELDS START */}

              <div className="flex gap-2">
                <input
                  type="time"
                  value={form.openTime}
                  className="w-1/2 border p-2 rounded-lg"
                  onChange={(e) =>
                    setForm({ ...form, openTime: e.target.value })
                  }
                />

                <input
                  type="time"
                  value={form.closeTime}
                  className="w-1/2 border p-2 rounded-lg"
                  onChange={(e) =>
                    setForm({ ...form, closeTime: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={form.rating}
                  placeholder="Rating (4.5)"
                  className="w-1/2 border p-2 rounded-lg"
                  onChange={(e) =>
                    setForm({ ...form, rating: e.target.value })
                  }
                />

                <input
                  type="text"
                  value={form.deliveryTime}
                  placeholder="Delivery Time (mins)"
                  className="w-1/2 border p-2 rounded-lg"
                  onChange={(e) =>
                    setForm({ ...form, deliveryTime: e.target.value })
                  }
                />

              </div>

              <input
                value={form.addOffer}
                placeholder="Add Offer (20% OFF Today)"
                className="w-full border p-2 rounded-lg"
                onChange={(e) =>
                  setForm({ ...form, addOffer: e.target.value })
                }
              />

              {/* 🔥 NEW FIELDS END */}

              <input
                type="file"
                accept="image/*"
                className="w-full border p-2 rounded-lg"
                onChange={(e) =>
                  setForm({
                    ...form,
                    image: e.target.files ? e.target.files[0] : null,
                  })
                }
              />

              <div className="flex gap-2">
                <input
                  value={form.latitude}
                  placeholder="Latitude"
                  className="w-1/2 border p-2 rounded-lg"
                  readOnly
                />
                <input
                  value={form.longitude}
                  placeholder="Longitude"
                  className="w-1/2 border p-2 rounded-lg"
                  readOnly
                />
              </div>

              <button
                onClick={getLocation}
                className="w-full bg-blue-500 text-white p-2 rounded-lg"
              >
                Auto Get Location
              </button>

              <div className="flex justify-between items-center">
                <label>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        isActive: e.target.checked,
                      })
                    }
                  />
                  <span className="ml-2">Active</span>
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={form.isOpen}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        isOpen: e.target.checked,
                      })
                    }
                  />
                  <span className="ml-2">Open</span>
                </label>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg"
              >
                {loading
                  ? "Saving..."
                  : editingId
                    ? "Update Restaurant"
                    : "Save Restaurant"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/*Delete  Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">

            <h3 className="text-lg font-semibold mb-3">
              Delete Restaurant
            </h3>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this restaurant?
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </button>
            </div>

          </div>
        </div>
      )}

    </>
  );
}
