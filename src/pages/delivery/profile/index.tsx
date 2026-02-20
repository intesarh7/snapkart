import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function DeliveryProfile() {

    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const res = await fetch("/api/delivery/profile")
    const data = await res.json()
    if (res.ok) setProfile(data.profile)
    setLoading(false)
  }

  const handleSave = async () => {
    const res = await fetch("/api/delivery/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    })

    const data = await res.json()

    if (res.ok) {
      toast.success(data.message)
    } else {
      toast.error(data.message)
    }
  }

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files || e.target.files.length === 0) return
  setSelectedFile(e.target.files[0])
}

const handleUpload = async () => {
  if (!selectedFile) {
    alert("Select image first")
    return
  }

  try {
    setUploading(true)

    const formData = new FormData()
    formData.append("image", selectedFile)

    const res = await fetch("/api/delivery/profile/upload-image", {
      method: "POST",
      body: formData
    })

    const data = await res.json()

    if (res.ok) {
      toast.success(data.message)
    } else {
      toast.error(data.message)
    }

  } catch (error) {
    console.error("Upload error:", error)
  } finally {
    setUploading(false)
  }
}


  if (loading) return <div className="p-6"><div className="animate-pulse h-40 bg-gray-200 rounded-xl" /></div>

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold">
        Delivery Profile
      </h1>

      <div className="bg-white rounded-xl shadow p-6 space-y-6">

        {/* PROFILE IMAGE */}
        <div className="flex items-center gap-6">

            <img
                src={profile.image || "/avatar.png"}
                className="w-24 h-24 rounded-full object-cover border"
            />

            <input
  type="file"
  accept="image/*"
  onChange={handleFileChange}
/>

<button onClick={handleUpload}>
  {uploading ? "Uploading..." : "Upload"}
</button>

            </div>

        {/* BASIC INFO */}
        <div className="grid md:grid-cols-2 gap-4">

          <div>
            <label className="text-sm text-gray-500">Name</label>
            <input
              value={profile.name || ""}
              onChange={(e) =>
                setProfile({ ...profile, name: e.target.value })
              }
              className="border p-2 rounded w-full mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Phone</label>
            <input
              value={profile.phone || ""}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
              className="border p-2 rounded w-full mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Email</label>
            <input
              value={profile.email || ""}
              disabled
              className="border p-2 rounded w-full mt-1 bg-gray-100"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">
              Availability
            </label>

            <select
              value={profile.isAvailable ? "ONLINE" : "OFFLINE"}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  isAvailable: e.target.value === "ONLINE"
                })
              }
              className="border p-2 rounded w-full mt-1"
            >
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </div>

        </div>

        {/* DELIVERY SETTINGS INFO */}
        <div className="grid md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">

          <div>
            <p className="text-sm text-gray-500">Max Orders</p>
            <p className="font-semibold">
              {profile.maxActiveOrders}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Commission Type</p>
            <p className="font-semibold">
              {profile.commissionType}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Commission Value</p>
            <p className="font-semibold">
              {profile.commissionValue ?? 0}
              {profile.commissionType === "PERCENTAGE" ? "%" : " ₹"}
            </p>
          </div>

        </div>

        {/* LOCATION */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">
            Current Location
          </p>
          <p className="text-sm">
            Lat: {profile.latitude || 0}
          </p>
          <p className="text-sm">
            Lng: {profile.longitude || 0}
          </p>
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Save Changes
        </button>

      </div>

    </div>
  )
}
