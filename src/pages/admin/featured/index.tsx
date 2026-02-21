import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

interface FeaturedItem {
  id: number;
  title: string;
  tag?: string;
  price?: number;
  image?: string;
  active: boolean;
}

export default function FeaturedPage() {
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [featuredList, setFeaturedList] = useState<FeaturedItem[]>([]);
  const [editItem, setEditItem] = useState<FeaturedItem | null>(null);

  const fetchFeatured = async () => {
    const res = await fetch("/api/admin/featured/get");
    const data = await res.json();
    setFeaturedList(data);
  };

  useEffect(() => {
    fetchFeatured();
  }, []);
  const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

  const handleCreate = async () => {
    let base64Image = null;

if (image) {
  base64Image = await toBase64(image);
}

const res = await fetch("/api/admin/featured/create", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
  body: JSON.stringify({
    title,
    tag,
    price,
    image: base64Image,
  }),
});

    const data = await res.json();

    if (data.success) {
      setMessage("Featured Added ✅");
      setTitle("");
      setTag("");
      setPrice("");
      setImage(null);
      fetchFeatured();
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/admin/featured/delete?id=${id}`, {
      method: "DELETE",
    });
    fetchFeatured();
  };

  const toggleActive = async (id: number) => {
    await fetch(`/api/admin/featured/toggle?id=${id}`, {
      method: "PUT",
    });
    fetchFeatured();
  };

  return (
    <>
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6">
          Manage Featured Section
        </h2>

        {message && (
          <div className="mb-4 bg-green-100 text-green-700 p-3 rounded">
            {message}
          </div>
        )}

        {/* Create Form */}
        <div className="bg-white p-6 rounded-2xl shadow mb-10 space-y-4">
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-3 rounded-xl"
          />

          <input
            placeholder="Offer Tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full border p-3 rounded-xl"
          />

          <input
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border p-3 rounded-xl"
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImage(e.target.files ? e.target.files[0] : null)
            }
            className="w-full border p-3 rounded-xl"
          />
          {image && (
  <img
    src={URL.createObjectURL(image)}
    className="w-full h-40 object-cover rounded-xl"
  />
)}

          <button
            onClick={handleCreate}
            className="bg-orange-600 text-white px-6 py-3 rounded-xl"
          >
            Add Featured
          </button>
        </div>

        {/* Featured List */}
        <div className="grid md:grid-cols-3 gap-6">
          {featuredList.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl shadow"
            >
              {item.image && (
                <img
                  src={item.image}
                  className="w-full h-40 object-cover rounded-xl mb-4"
                />
              )}

              <h3 className="text-lg font-bold">
                {item.title}
              </h3>

              <p className="text-sm text-gray-500">
                {item.tag}
              </p>

              <p className="font-semibold mt-2">
                ${item.price}
              </p>

              <div className="flex justify-between mt-4">
                <button
                  onClick={() => toggleActive(item.id)}
                  className={`px-3 py-1 rounded text-sm ${
                    item.active
                      ? "bg-green-600 text-white"
                      : "bg-gray-400 text-white"
                  }`}
                >
                  {item.active ? "Active" : "Inactive"}
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
