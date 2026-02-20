import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function CategoryPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // ✅ EDIT STATES ADDED
  const [editCategory, setEditCategory] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);

  /* ---------------- FETCH RESTAURANTS ---------------- */

  useEffect(() => {
    fetch("/api/admin/restaurants/get")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRestaurants(data);
        } else if (data.restaurants) {
          setRestaurants(data.restaurants);
        }
      });
  }, []);

  /* ---------------- FETCH CATEGORIES ---------------- */

  const fetchCategories = async (restaurantId: string) => {
    if (!restaurantId) return;

    const res = await fetch(
      `/api/admin/category/get?restaurantId=${restaurantId}`
    );

    const data = await res.json();
    setCategories(data);
  };

  /* ---------------- ADD CATEGORY ---------------- */

  const handleAddCategory = async () => {
    if (!selectedRestaurant || !categoryName) {
      setMessage("Restaurant and category required ❌");
      return;
    }

    const formData = new FormData();
    formData.append("name", categoryName);
    formData.append("restaurantId", selectedRestaurant);

    if (categoryImage) {
      formData.append("image", categoryImage);
    }

    const res = await fetch("/api/admin/category/create", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      setMessage("Category Added Successfully ✅");
      setCategoryName("");
      setCategoryImage(null);
      fetchCategories(selectedRestaurant);
    } else {
      setMessage(data.message);
    }
  };

  /* ---------------- UPDATE CATEGORY ---------------- */

 const handleUpdateCategory = async () => {
  if (!editCategory) return;

  const formData = new FormData();
  formData.append("id", String(editCategory.id));
  formData.append("name", editName);
  formData.append("restaurantId", selectedRestaurant);

  if (editImage) {
    formData.append("image", editImage);
  }

  const res = await fetch("/api/admin/category/update", {
    method: "PUT",
    body: formData,
  });

  const data = await res.json();

  if (data.success) {
    setEditCategory(null);
    setEditImage(null);
    fetchCategories(selectedRestaurant);
  }
};

  /* ---------------- DELETE CATEGORY ---------------- */

  const handleDelete = async () => {
    if (!deleteId) return;

    await fetch(`/api/admin/category/delete?id=${deleteId}`, {
      method: "DELETE",
    });

    setDeleteId(null);
    fetchCategories(selectedRestaurant);
  };

  return (
    <>
      <div className="p-8 bg-gray-50 min-h-screen">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">
          Manage Categories
        </h2>

        {message && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-xl shadow">
            {message}
          </div>
        )}

        {/* Restaurant Selector */}
        <div className="mb-8 bg-white p-6 rounded-2xl shadow">
          <label className="block mb-2 font-semibold text-gray-700">
            Select Restaurant
          </label>

          <select
            value={selectedRestaurant}
            onChange={(e) => {
              setSelectedRestaurant(e.target.value);
              fetchCategories(e.target.value);
            }}
            className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Restaurant</option>
            {restaurants.map((r: any) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Add Category Card */}
        <div className="bg-white p-6 rounded-2xl shadow mb-10">
          <h3 className="text-lg font-semibold mb-4">
            Add New Category
          </h3>

          <div className="flex flex-col md:flex-row gap-4">
            <input
              value={categoryName}
              placeholder="Enter Category Name"
              onChange={(e) =>
                setCategoryName(e.target.value)
              }
              className="flex-1 border p-3 rounded-xl"
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setCategoryImage(
                  e.target.files ? e.target.files[0] : null
                )
              }
              className="border p-3 rounded-xl"
            />

            <button
              onClick={handleAddCategory}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl shadow transition"
            >
              Add
            </button>
          </div>
        </div>

        {/* Category Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((c: any) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition p-5"
            >
              {c.image && (
                <img
                  src={c.image}
                  className="w-full h-40 object-cover rounded-xl mb-4"
                />
              )}

              <h4 className="text-lg font-semibold mb-3">
                {c.name}
              </h4>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    setEditCategory(c);
                    setEditName(c.name);
                  }}
                  className="text-blue-600 text-sm font-medium"
                >
                  Edit
                </button>

                <button
                  onClick={() => setDeleteId(c.id)}
                  className="text-red-600 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* EDIT MODAL */}
        {editCategory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
              <h3 className="text-xl font-semibold mb-4">
                Edit Category
              </h3>

              <input
                value={editName}
                onChange={(e) =>
                  setEditName(e.target.value)
                }
                className="w-full border p-3 rounded-xl mb-4"
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setEditImage(
                    e.target.files ? e.target.files[0] : null
                  )
                }
                className="w-full border p-3 rounded-xl mb-6"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditCategory(null)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpdateCategory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE MODAL (Same as Before) */}
        {deleteId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-2xl shadow-lg w-80">
              <h3 className="text-lg font-semibold mb-4">
                Delete Category?
              </h3>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl"
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
