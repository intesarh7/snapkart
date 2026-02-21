import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function ProductPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const calculatePreviewFinalPrice = () => {
    
  let base = Number(form.price) || 0;

  const offerValue = Number(form.offerValue) || 0;
  const extraValue = Number(form.extraValue) || 0;

  if (form.offerType === "percentage") {
    base -= (base * offerValue) / 100;
  }

  if (form.offerType === "flat") {
    base -= offerValue;
  }

  if (form.extraType === "percentage") {
    base -= (base * extraValue) / 100;
  }

  if (form.extraType === "flat") {
    base -= extraValue;
  }

  return base > 0 ? base.toFixed(2) : "0.00";
};


  const [form, setForm] = useState<any>({
    name: "",
    description: "",
    categoryId: "",
    restaurantId: "",
    isAvailable: true,
    isActive: true,
    price: "",
    offerType: "",
    offerValue: "",
    extraType: "",
    extraValue: "",
    rating: "",
    variants: [],
    extras: [],
    image: null,
  });

  const fetchProducts = async () => {
    const res = await fetch("/api/admin/product/get");
    const data = await res.json();
    if (data.success) {
    setProducts(data.products);
  } else {
    setProducts([]);
    console.error(data.message);
  }
  };

useEffect(() => {
  fetch("/api/admin/restaurants/list")
    .then((res) => res.json())
    .then(setRestaurants);
}, []);

  useEffect(() => {
    fetchProducts();
  }, []);

const handleRestaurantChange = async (id: string) => {
  
  setForm({ ...form, restaurantId: id, categoryId: "" });

  if (!id) return;

  const res = await fetch(
    `/api/admin/category/get?restaurantId=${id}`
  );

  const data = await res.json();
  setCategories(data);
};

const handleSubmit = async () => {
  let base64Image = null;
const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
if (form.image) {
  base64Image = await toBase64(form.image);
}

  const url = editingId
    ? `/api/admin/product/update?id=${editingId}`
    : "/api/admin/product/create";

  const method = editingId ? "PUT" : "POST";

const res = await fetch(url, {
  method,
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
  body: JSON.stringify({
    name: form.name,
    description: form.description,
    category: form.category,
    categoryId: form.categoryId,
    available: form.isAvailable,
    active: form.isActive,
    price: form.price,
    offerType: form.offerType,
    offerValue: form.offerValue,
    extraType: form.extraType,
    extraValue: form.extraValue,
    rating: form.rating,
    restaurantId: form.restaurantId,
    image: base64Image,
    variants: form.variants,
    extras: form.extras,
  }),
});
  const data = await res.json();

  if (data.success) {
    setShowModal(false);
    setEditingId(null);

    // Reset form
    setForm({
      name: "",
      description: "",
      category: "",
      isAvailable: true,
      isActive: true,
      price: "",
      offerType: "",
      offerValue: "",
      extraType: "",
      extraValue: "",
      rating: "",
      image: null,
    });

    fetchProducts();
  }
};

  const confirmDelete = async () => {
    if (!deleteId) return;

    await fetch(`/api/admin/product/delete?id=${deleteId}`, {
      method: "DELETE",
    });

    setShowDelete(false);
    fetchProducts();
  };

 
 

  return (
    <>
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Products</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Product
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
  <table className="min-w-full text-sm">
    <thead className="bg-gray-100 text-gray-700">
      <tr>
        <th className="p-3 w-10"></th> 
        <th className="p-3">Image</th>
        <th className="p-3">Name</th>
        <th className="p-3">Category</th>
        <th className="p-3">Price</th>
        <th className="p-3">Offer</th>
        <th className="p-3">Extra Offer</th>
        <th className="p-3">Add-ons</th> 
        <th className="p-3">Available</th>
        <th className="p-3">Active</th>
        <th className="p-3">Rating</th>
        <th className="p-3">Final Price</th>
        <th className="p-3 text-right">Actions</th>
      </tr>
    </thead>

    <tbody className="text-center">
  {products.map((p) => (
    <React.Fragment key={p.id}>
      
      {/* MAIN ROW */}
      <tr className="border-t hover:bg-gray-50">

        {/* Expand Button */}
        <td className="p-3">
          <button
            onClick={() =>
              setExpandedId(expandedId === p.id ? null : p.id)
            }
            className="text-gray-500 hover:text-black text-sm"
          >
            {expandedId === p.id ? "−" : "+"}
          </button>
        </td>

        {/* Image */}
        <td className="p-3">
          {p.image ? (
            <img
              src={p.image}
              className="w-12 h-12 rounded object-cover border"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
              N/A
            </div>
          )}
        </td>

        {/* Name */}
        <td className="p-3 font-medium">{p.name}</td>

        {/* Category */}
        <td className="p-3">{p.category}</td>

        {/* Price */}
        <td className="p-3">₹{p.price}</td>

        {/* Offer */}
        <td className="p-3">
          {p.offerType
            ? `${p.offerValue} ${
                p.offerType === "percentage" ? "%" : "₹"
              }`
            : "—"}
        </td>

        {/* Extra Offer */}
        <td className="p-3">
          {p.extraType
            ? `${p.extraValue} ${
                p.extraType === "percentage" ? "%" : "₹"
              }`
            : "—"}
        </td>

        {/* Add-ons summary (compact) */}
        <td className="p-3 text-xs">
          {p.extras && p.extras.length > 0
            ? `${p.extras.length} Add-ons`
            : "—"}
        </td>

        {/* Available */}
        <td className="p-3">
          <span
            className={`px-2 py-1 rounded text-xs ${
              p.isAvailable
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {p.isAvailable ? "Yes" : "No"}
          </span>
        </td>

        {/* Active */}
        <td className="p-3">
          <span
            className={`px-2 py-1 rounded text-xs ${
              p.isActive
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {p.isActive ? "Active" : "Inactive"}
          </span>
        </td>

        {/* Rating */}
        <td className="p-3">{p.rating} ⭐</td>

        {/* Final Price */}
        <td className="p-3">₹ {p.finalPrice}</td>

        {/* Actions */}
        <td className="p-3 text-right space-x-2">
          <button
            onClick={async () => {
              const res = await fetch(
                `/api/admin/category/get?restaurantId=${p.restaurantId}`
              );
              const data = await res.json();
              setCategories(data);

              setEditingId(p.id);

              setForm({
                name: p.name || "",
                description: p.description || "",
                category: p.category || "",
                categoryId: p.categoryId ? String(p.categoryId) : "",
                restaurantId: p.restaurantId
                  ? String(p.restaurantId)
                  : "",
                isAvailable: p.isAvailable,
                isActive: p.isActive,
                price: p.price ? String(p.price) : "",
                offerType: p.offerType || "",
                offerValue: p.offerValue
                  ? String(p.offerValue)
                  : "",
                extraType: p.extraType || "",
                extraValue: p.extraValue
                  ? String(p.extraValue)
                  : "",
                rating: p.rating ? String(p.rating) : "0",
                variants: p.variants || [],
                extras: p.extras || [],
                image: null,
              });

              setShowModal(true);
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs"
          >
            Edit
          </button>

          <button
            onClick={() => {
              setDeleteId(p.id);
              setShowDelete(true);
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
          >
            Delete
          </button>
        </td>
      </tr>

      {/* EXPANDABLE ROW */}
      {expandedId === p.id && (
        <tr className="bg-gray-50">
          <td colSpan={13} className="p-4 text-left">

            {/* Variants */}
            <div className="mb-3">
              <h4 className="text-sm font-semibold mb-2">
                Variants
              </h4>

              {p.variants && p.variants.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {p.variants.map((v: any) => (
                    <span
                      key={v.id}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs"
                    >
                      {v.name} - ₹{v.price}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-gray-500">
                  No Variants
                </span>
              )}
            </div>

            {/* Extras */}
            <div>
              <h4 className="text-sm font-semibold mb-2">
                Add-ons
              </h4>

              {p.extras && p.extras.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {p.extras.map((ex: any) => (
                    <span
                      key={ex.id}
                      className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-xs"
                    >
                      {ex.name} - ₹{ex.price}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-gray-500">
                  No Add-ons
                </span>
              )}
            </div>

          </td>
        </tr>
      )}

    </React.Fragment>
  ))}
</tbody>

  </table>
</div>


      {/* ADD / EDIT MODAL */}
        {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl w-full max-w-2xl shadow-xl overflow-y-auto max-h-[90vh]">

            <h3 className="text-xl font-bold mb-6">
            {editingId ? "Edit Product" : "Add Product"}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium">
                  Restaurant
                </label>
                <select
                    value={form.restaurantId}
                    onChange={(e) =>
                      handleRestaurantChange(e.target.value)
                    }
                    className="w-full border p-2 rounded-lg"
                  >
                    <option value="">Select Restaurant</option>
                    {restaurants.map((r: any) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">
                  Category
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm({ ...form, categoryId: e.target.value })
                  }
                  className="w-full border p-2 rounded-lg mt-3"
                >
                  <option value="">Select Category</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
                {/* Name */}
                <div className="col-span-2">
                <label className="text-sm font-medium">Name</label>
                <input
                    type="text"
                    className="w-full border p-2 rounded-lg mt-1"
                    value={form.name}
                    onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                    }
                />
                </div>

                {/* Description */}
                <div className="col-span-2">
                <label className="text-sm font-medium">
                    Description
                </label>
                <textarea
                    className="w-full border p-2 rounded-lg mt-1"
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                    setForm({
                        ...form,
                        description: e.target.value,
                    })
                    }
                />
                </div>

                {/* Image */}
                <div className="col-span-2">
                <label className="text-sm font-medium">Image</label>
                <input
                    type="file"
                    className="w-full border p-2 rounded-lg mt-1"
                    onChange={(e) =>
                    setForm({
                        ...form,
                        image: e.target.files?.[0],
                    })
                    }
                />
                </div>

                {/* Category */}
                <div>
                <label className="text-sm font-medium">
                    Category
                </label>
                <select
                    className="w-full border p-2 rounded-lg mt-1"
                    value={form.category}
                    onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                    }
                >
                    <option value="">Select</option>
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Dessert">Dessert</option>
                </select>
                </div>

                {/* Available */}
                <div>
                <label className="text-sm font-medium">
                    Available
                </label>
                <select
                  className="w-full border p-2 rounded-lg mt-1"
                  value={form.isAvailable ? "true" : "false"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      isAvailable: e.target.value === "true",
                    })
                  }
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
                </div>

                {/* Active */}
                <div>
                <label className="text-sm font-medium">
                    Active
                </label>
                <select
                  className="w-full border p-2 rounded-lg mt-1"
                  value={form.isActive ? "true" : "false"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      isActive: e.target.value === "true",
                    })
                  }
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
                </div>

                {/* Price */}
                <div>
                <label className="text-sm font-medium">Price</label>
                <input
                    type="number"
                    className="w-full border p-2 rounded-lg mt-1"
                    value={form.price}
                    onChange={(e) =>
                    setForm({ ...form, price: e.target.value })
                    }
                />
                </div>

                {/* Offer Type */}
                <div>
                <label className="text-sm font-medium">
                    Offer Type
                </label>
                <select
                    className="w-full border p-2 rounded-lg mt-1"
                    value={form.offerType}
                    onChange={(e) =>
                    setForm({
                        ...form,
                        offerType: e.target.value,
                    })
                    }
                >
                    <option value="">None</option>
                    <option value="percentage">
                    Percentage
                    </option>
                    <option value="flat">Flat</option>
                </select>
                </div>

                {/* Offer Value */}
                <div>
                <label className="text-sm font-medium">
                    Offer Value
                </label>
                <input
                    type="number"
                    className="w-full border p-2 rounded-lg mt-1"
                    value={form.offerValue}
                    onChange={(e) =>
                    setForm({
                        ...form,
                        offerValue: e.target.value,
                    })
                    }
                />
                </div>

                {/* Extra Offer Type */}
                <div>
                <label className="text-sm font-medium">
                    Extra Offer Type
                </label>
                <select
                    className="w-full border p-2 rounded-lg mt-1"
                    value={form.extraType}
                    onChange={(e) =>
                    setForm({
                        ...form,
                        extraType: e.target.value,
                    })
                    }
                >
                    <option value="">None</option>
                    <option value="percentage">
                    Percentage
                    </option>
                    <option value="flat">Flat</option>
                </select>
                </div>

                {/* Extra Offer Value */}
                <div>
                <label className="text-sm font-medium">
                    Extra Offer Value
                </label>
                <input
                    type="number"
                    className="w-full border p-2 rounded-lg mt-1"
                    value={form.extraValue}
                    onChange={(e) =>
                    setForm({
                        ...form,
                        extraValue: e.target.value,
                    })
                    }
                />
                </div>
                <div>
                <label className="text-sm font-medium">
                  Final Price
                </label>
                <input
                  type="text"
                  value={calculatePreviewFinalPrice()}
                  readOnly
                  className="w-full border p-2 rounded-lg bg-gray-100 mt-1"
                />
              </div>

                {/* Rating */}
                <div>
                <label className="text-sm font-medium">
                    Rating
                </label>
                <select
                    className="w-full border p-2 rounded-lg mt-1"
                    value={form.rating}
                    onChange={(e) =>
                    setForm({
                        ...form,
                        rating: e.target.value,
                    })
                    }
                >
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
                </div>
                {/* VARIANTS (Sizes) */}
<div className="col-span-2 mt-2 border rounded-lg p-3 bg-gray-50">
  <div className="flex justify-between items-center mb-2">
    <h4 className="text-sm font-semibold">Variants (Sizes)</h4>
    <button
      type="button"
      onClick={() =>
        setForm({
          ...form,
          variants: [...form.variants, { name: "", price: "" }],
        })
      }
      className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
    >
      + Add Size
    </button>
  </div>

  <div className="space-y-2">
    {form.variants.map((v: any, index: number) => (
      <div key={index} className="flex gap-2">
        <input
          type="text"
          placeholder="Size (Small)"
          value={v.name}
          onChange={(e) => {
            const updated = [...form.variants];
            updated[index].name = e.target.value;
            setForm({ ...form, variants: updated });
          }}
          className="flex-1 border p-2 rounded text-sm"
        />
        <input
          type="number"
          placeholder="Price"
          value={v.price}
          onChange={(e) => {
            const updated = [...form.variants];
            updated[index].price = e.target.value;
            setForm({ ...form, variants: updated });
          }}
          className="w-28 border p-2 rounded text-sm"
        />
        <button
          type="button"
          onClick={() => {
            const updated = form.variants.filter(
              (_: any, i: number) => i !== index
            );
            setForm({ ...form, variants: updated });
          }}
          className="text-red-500 text-xs"
        >
          ✕
        </button>
      </div>
    ))}
  </div>
</div>

{/* EXTRAS (Add-ons) */}
<div className="col-span-2 mt-2 border rounded-lg p-3 bg-gray-50">
  <div className="flex justify-between items-center mb-2">
    <h4 className="text-sm font-semibold">Extras (Add-ons)</h4>
    <button
      type="button"
      onClick={() =>
        setForm({
          ...form,
          extras: [...form.extras, { name: "", price: "" }],
        })
      }
      className="text-xs bg-purple-600 text-white px-2 py-1 rounded"
    >
      + Add Extra
    </button>
  </div>

  <div className="space-y-2">
    {form.extras.map((ex: any, index: number) => (
      <div key={index} className="flex gap-2">
        <input
          type="text"
          placeholder="Extra Cheese"
          value={ex.name}
          onChange={(e) => {
            const updated = [...form.extras];
            updated[index].name = e.target.value;
            setForm({ ...form, extras: updated });
          }}
          className="flex-1 border p-2 rounded text-sm"
        />
        <input
          type="number"
          placeholder="Price"
          value={ex.price}
          onChange={(e) => {
            const updated = [...form.extras];
            updated[index].price = e.target.value;
            setForm({ ...form, extras: updated });
          }}
          className="w-28 border p-2 rounded text-sm"
        />
        <button
          type="button"
          onClick={() => {
            const updated = form.extras.filter(
              (_: any, i: number) => i !== index
            );
            setForm({ ...form, extras: updated });
          }}
          className="text-red-500 text-xs"
        >
          ✕
        </button>
      </div>
    ))}
  </div>
</div>

            </div>

            <div className="flex justify-end gap-3 mt-6">
                <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg"
                >
                Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  {editingId ? "Update Product" : "Save Product"}
                </button>                 
            </div>

            </div>
        </div>
        )}


            
          

      {/* DELETE MODAL */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl">
            <p>Delete this product?</p>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowDelete(false)}>
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded"
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
