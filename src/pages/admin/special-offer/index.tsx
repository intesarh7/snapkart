import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

interface Offer {
  id: number;
  title: string;
  priceText?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string;
  active: boolean;
}

export default function SpecialOfferAdmin() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [title, setTitle] = useState("");
  const [priceText, setPriceText] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonLink, setButtonLink] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [editItem, setEditItem] = useState<Offer | null>(null);

  const fetchOffers = async () => {
    const res = await fetch("/api/admin/special-offer/get");
    const data = await res.json();
    setOffers(data);
  };

  useEffect(() => {
    fetchOffers();
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

    await fetch("/api/admin/special-offer/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        title,
        priceText,
        buttonText,
        buttonLink,
        image: base64Image,
      }),
    });

    setTitle("");
    setPriceText("");
    setButtonText("");
    setButtonLink("");
    setImage(null);
    fetchOffers();
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/admin/special-offer/delete?id=${id}`, {
      method: "DELETE",
    });
    fetchOffers();
  };

  const toggleActive = async (id: number) => {
    await fetch(`/api/admin/special-offer/toggle?id=${id}`, {
      method: "PUT",
    });
    fetchOffers();
  };

  const handleUpdate = async () => {
    if (!editItem) return;

    let base64Image = null;

    if (image) {
      base64Image = await toBase64(image);
    }

    await fetch("/api/admin/special-offer/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        id: editItem.id,
        title: editItem.title,
        priceText: editItem.priceText,
        buttonText: editItem.buttonText,
        buttonLink: editItem.buttonLink,
        image: base64Image, // optional
      }),
    });
    setEditItem(null);
    setImage(null);
    fetchOffers();
  };

  return (
    <>
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-8">
          Manage Special Offers
        </h2>

        {/* CREATE FORM */}
        <div className="bg-white p-6 rounded-2xl shadow mb-10 space-y-4">
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-3 rounded-xl"
          />

          <input
            placeholder="Price Text (Only ₹129)"
            value={priceText}
            onChange={(e) => setPriceText(e.target.value)}
            className="w-full border p-3 rounded-xl"
          />

          <input
            placeholder="Button Text"
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
            className="w-full border p-3 rounded-xl"
          />

          <input
            placeholder="Button Link"
            value={buttonLink}
            onChange={(e) => setButtonLink(e.target.value)}
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

          <button
            onClick={handleCreate}
            className="bg-orange-600 text-white px-6 py-3 rounded-xl"
          >
            Add Offer
          </button>
        </div>

        {/* LIST */}
        <div className="grid md:grid-cols-2 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white p-6 rounded-2xl shadow"
            >
              {offer.image && (
                <img
                  src={offer.image}
                  className="w-full h-40 object-cover rounded-xl mb-4"
                />
              )}

              <h3 className="text-lg font-bold">
                {offer.title}
              </h3>

              <p className="text-sm text-gray-500">
                {offer.priceText}
              </p>

              <div className="flex justify-between mt-4">
                <button
                  onClick={() => toggleActive(offer.id)}
                  className={`px-3 py-1 rounded text-sm ${offer.active
                      ? "bg-green-600 text-white"
                      : "bg-gray-400 text-white"
                    }`}
                >
                  {offer.active ? "Active" : "Inactive"}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditItem(offer)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(offer.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* EDIT MODAL */}
        {editItem && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl w-96 space-y-4">
              <h3 className="text-xl font-bold">
                Edit Offer
              </h3>

              <input
                value={editItem.title}
                onChange={(e) =>
                  setEditItem({
                    ...editItem,
                    title: e.target.value,
                  })
                }
                className="w-full border p-3 rounded-xl"
              />

              <input
                value={editItem.priceText || ""}
                onChange={(e) =>
                  setEditItem({
                    ...editItem,
                    priceText: e.target.value,
                  })
                }
                className="w-full border p-3 rounded-xl"
              />

              <input
                value={editItem.buttonText || ""}
                onChange={(e) =>
                  setEditItem({
                    ...editItem,
                    buttonText: e.target.value,
                  })
                }
                className="w-full border p-3 rounded-xl"
              />

              <input
                value={editItem.buttonLink || ""}
                onChange={(e) =>
                  setEditItem({
                    ...editItem,
                    buttonLink: e.target.value,
                  })
                }
                className="w-full border p-3 rounded-xl"
              />

              <input
                type="file"
                onChange={(e) =>
                  setImage(
                    e.target.files ? e.target.files[0] : null
                  )
                }
                className="w-full border p-3 rounded-xl"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditItem(null)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-orange-600 text-white rounded-xl"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
