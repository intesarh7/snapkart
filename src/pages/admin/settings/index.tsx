"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

export default function WebsiteSettings() {
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<any>(null);
  const [headerFile, setHeaderFile] = useState<File | null>(null);
  const [footerFile, setFooterFile] = useState<File | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => setForm(data || {}));
  }, []);

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      let headerBase64 = null;
      let footerBase64 = null;

      if (headerFile) {
        headerBase64 = await toBase64(headerFile);
      }

      if (footerFile) {
        footerBase64 = await toBase64(footerFile);
      }

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          headerLogo: headerBase64,
          footerLogo: footerBase64,
        }),
      });

      if (!res.ok) throw new Error();

      showToast("success", "Settings updated successfully");

      // refresh updated data
      const updated = await fetch("/api/admin/settings").then(res => res.json());
      setForm(updated || {});
      setHeaderFile(null);
      setFooterFile(null);

    } catch (error) {
      showToast("error", "Something went wrong");
    }

    setLoading(false);
  };
  return (
    <div className="p-6 w-full mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-slide-in">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white ${toast.type === "success"
              ? "bg-green-600"
              : "bg-red-600"
              }`}
          >
            {toast.type === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <XCircle size={20} />
            )}
            <span className="text-sm font-medium">
              {toast.message}
            </span>
          </div>
        </div>
      )}

      <h1 className="text-xl font-semibold">
        Website Settings
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid lg:grid-cols-3 gap-6"
      >
        {/* CONTACT CARD */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-sm text-gray-600">
            Contact Info
          </h2>

          <input
            name="contactNumber"
            value={form.contactNumber || ""}
            onChange={handleChange}
            placeholder="Contact Number"
            className="w-full px-4 py-2 text-sm rounded-lg bg-gray-50 focus:ring-2 focus:ring-black outline-none"
          />

          <input
            name="email"
            value={form.email || ""}
            onChange={handleChange}
            placeholder="Email"
            className="w-full px-4 py-2 text-sm rounded-lg bg-gray-50 focus:ring-2 focus:ring-black outline-none"
          />

          <textarea
            name="address"
            value={form.address || ""}
            onChange={handleChange}
            placeholder="Address"
            rows={3}
            className="w-full px-4 py-2 text-sm rounded-lg bg-gray-50 focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        {/* SOCIAL CARD */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-sm text-gray-600">
            Social Media
          </h2>

          {["facebook", "instagram", "twitter", "youtube"].map(
            (field) => (
              <input
                key={field}
                name={field}
                value={form[field] || ""}
                onChange={handleChange}
                placeholder={`${field} link`}
                className="w-full px-4 py-2 text-sm rounded-lg bg-gray-50 focus:ring-2 focus:ring-black outline-none"
              />
            )
          )}
        </div>

        {/* BRANDING CARD */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-sm text-gray-600">
            Branding
          </h2>

          <div>
            <label className="text-xs text-gray-500">
              Header Logo
            </label>
            <input
              type="file"
              onChange={(e) =>
                setHeaderFile(e.target.files ? e.target.files[0] : null)
              }
              className="w-full mt-1 text-sm"
            />
            {form.headerLogo && (
              <img
                src={form.headerLogo}
                className="h-12 mt-2 object-contain"
              />
            )}
            {headerFile && (
              <img
                src={URL.createObjectURL(headerFile)}
                className="h-12 mt-2 object-contain"
              />
            )}
          </div>

          <div>
            <label className="text-xs text-gray-500">
              Footer Logo
            </label>
            <input
              type="file"
              onChange={(e) =>
                setFooterFile(e.target.files ? e.target.files[0] : null)
              }
              className="w-full mt-1 text-sm"
            />
            {form.footerLogo && (
              <img
                src={form.footerLogo}
                className="h-12 mt-2 object-contain"
              />
            )}
            {footerFile && (
              <img
                src={URL.createObjectURL(footerFile)}
                className="h-12 mt-2 object-contain"
              />
            )}
          </div>

          <textarea
            name="footerInfo"
            value={form.footerInfo || ""}
            onChange={handleChange}
            placeholder="Footer Info"
            rows={3}
            className="w-full px-4 py-2 text-sm rounded-lg bg-gray-50 focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        {/* SAVE BUTTON */}
        <div className="lg:col-span-3 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-6 py-2 rounded-xl text-sm hover:opacity-80 transition"
          >
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
