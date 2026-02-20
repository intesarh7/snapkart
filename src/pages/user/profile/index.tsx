import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { MapPin } from "lucide-react";
import Seo from "@/components/Seo";

interface Address {
  id: number;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

export default function UserProfile() {
  const [user, setUser] = useState<any>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editAddressData, setEditAddressData] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    name: "",
    phone: "",
  });

  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
  }, []);

  const fetchProfile = async () => {
    const res = await fetch("/api/user/profile/get", { cache: "no-store" });
    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      setEditProfileData({
        name: data.user.name,
        phone: data.user.phone,
      });
    }
  };

  const fetchAddresses = async () => {
    const res = await fetch("/api/user/address/list", { cache: "no-store" });
    const data = await res.json();
    if (res.ok) setAddresses(data.addresses);
    setLoading(false);
  };

  /* ================= DETECT LOCATION ================= */
  const detectLocation = (type: "new" | "edit") => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);

        if (type === "new") {
          setNewAddress({
            ...newAddress,
            latitude: lat,
            longitude: lng,
          });
        } else if (type === "edit") {
          setEditAddressData({
            ...editAddressData,
            latitude: lat,
            longitude: lng,
          });
        }

        toast.success("Location detected");
      },
      () => toast.error("Location permission denied")
    );
  };

  /* ================= ADD ADDRESS ================= */
  const handleAddAddress = async () => {
    if (!newAddress.latitude || !newAddress.longitude) {
      toast.error("Please detect location before saving");
      return;
    }

    const res = await fetch("/api/user/address/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAddress),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message);
      return;
    }

    toast.success("Address added");
    setNewAddress({
      fullName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      latitude: "",
      longitude: "",
    });

    fetchAddresses();
  };

  /* ================= UPDATE ADDRESS ================= */
  const handleUpdateAddress = async () => {
    if (!editAddressData.latitude || !editAddressData.longitude) {
      toast.error("Please detect location before updating");
      return;
    }

    const res = await fetch("/api/user/address/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editAddressData),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message);
      return;
    }

    toast.success("Address updated");
    setEditAddressData(null);
    fetchAddresses();
  };

  /* ================= DELETE ================= */
  const deleteAddress = async (id: number) => {
    const res = await fetch("/api/user/address/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const data = await res.json();
    if (!res.ok) {
      toast.error(data.message);
      return;
    }

    toast.success("Address deleted");
    fetchAddresses();
  };

  /* ================= SET DEFAULT ================= */
  const setDefaultAddress = async (id: number) => {
    await fetch("/api/user/address/set-default", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchAddresses();
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <>
      <Seo
        title={`${user?.name || "My"} Profile | SnapKart`}
        description="Manage your SnapKart profile."
        url="https://yourdomain.com/user/profile"
      />
      <meta name="robots" content="noindex,nofollow" />
      {/* ===== Small Header Section ===== */}
      <div className="mb-10">
        <div className="bg-linear-to-r from-orange-500 to-orange-600 h-60 flex flex-col justify-end py-8 px-6 text-center shadow-lg relative overflow-hidden">
          {/* Soft background glow */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white,transparent_70%)]"></div>
          <h1 className="text-2xl md:text-3xl font-bold text-white relative z-10"> Welcome {user?.name} </h1>
          <p className="text-orange-100 mt-2 text-sm md:text-base relative z-10"> View, edit and add your address. </p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* ================= ADDRESS SECTION ================= */}
        <div className="bg-white border shadow-md rounded-xl p-5">
          <h3 className="text-lg font-semibold mb-4">My Addresses</h3>

          <div className="grid md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`p-4 border rounded-lg relative ${addr.isDefault
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200"
                  }`}
              >
                {addr.isDefault && (
                  <span className="absolute top-2 right-2 text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                    Default
                  </span>
                )}

                <p className="font-medium">{addr.fullName}</p>
                <p>{addr.address}, {addr.city}</p>
                <p>{addr.state} - {addr.pincode}</p>
                <p>{addr.phone}</p>

                <div className="flex gap-3 mt-3 text-sm">
                  {!addr.isDefault && (
                    <button
                      onClick={() => setDefaultAddress(addr.id)}
                      className="text-orange-600"
                    >
                      Set Default
                    </button>
                  )}

                  <button
                    onClick={() => setEditAddressData(addr)}
                    className="text-blue-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteAddress(addr.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= ADD ADDRESS ================= */}
        <div className="bg-white border shadow-md rounded-xl p-5">
          <h3 className="text-lg font-semibold mb-3">Add New Address</h3>

          <div className="grid md:grid-cols-2 gap-3">
            {Object.keys(newAddress).map((key) => {

              const lowerKey = key.toLowerCase();
              const isLatLon =
                lowerKey.includes("lat") || lowerKey.includes("lon");

              return (
                <input
                  key={key}
                  placeholder={key}
                  value={(newAddress as any)[key]}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      [key]: e.target.value,
                    })
                  }
                  disabled={isLatLon}
                  readOnly={isLatLon}
                  className={`border p-2 rounded-lg text-sm ${isLatLon
                      ? "bg-gray-200 cursor-not-allowed opacity-60"
                      : ""
                    }`}
                />
              );
            })}
          </div>

          <button
            onClick={() => detectLocation("new")}
            className="mt-3 flex items-center gap-2 text-orange-600 text-sm"
          >
            <MapPin size={16} /> Detect My Location
          </button>

          <button
            onClick={handleAddAddress}
            className="mt-4 bg-orange-500 text-white px-5 py-2 rounded-lg"
          >
            Add Address
          </button>
        </div>

        {/* ================= EDIT MODAL ================= */}
        {editAddressData && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-3">
              <h3 className="font-semibold">Edit Address</h3>

              {Object.keys(editAddressData).map((key) =>
                key !== "id" && key !== "isDefault" ? (
                  <input
                    key={key}
                    value={editAddressData[key] || ""}
                    onChange={(e) =>
                      setEditAddressData({
                        ...editAddressData,
                        [key]: e.target.value,
                      })
                    }
                    className="border p-2 rounded-lg w-full text-sm"
                  />
                ) : null
              )}

              <button
                onClick={() => detectLocation("edit")}
                className="flex items-center gap-2 text-orange-600 text-sm"
              >
                <MapPin size={16} /> Detect My Location
              </button>

              <div className="flex gap-3 pt-3">
                <button
                  onClick={handleUpdateAddress}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg"
                >
                  Update
                </button>
                <button
                  onClick={() => setEditAddressData(null)}
                  className="bg-gray-400 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
