"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

export default function WebsiteSettings() {
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => setForm(data || {}));
  }, []);

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

    const formData = new FormData();

    Object.keys(form).forEach((key) => {
      if (form[key] !== null && form[key] !== undefined) {
        formData.append(key, form[key]);
      }
    });

    const headerLogo = (document.getElementById(
      "headerLogo"
    ) as HTMLInputElement).files?.[0];

    const footerLogo = (document.getElementById(
      "footerLogo"
    ) as HTMLInputElement).files?.[0];

    if (headerLogo) formData.append("headerLogo", headerLogo);
    if (footerLogo) formData.append("footerLogo", footerLogo);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) throw new Error();

      showToast("success", "Settings updated successfully");
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
            className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white ${
              toast.type === "success"
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
              id="headerLogo"
              className="w-full mt-1 text-sm"
            />
            {form.headerLogo && (
              <img
                src={form.headerLogo}
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
              id="footerLogo"
              className="w-full mt-1 text-sm"
            />
            {form.footerLogo && (
              <img
                src={form.footerLogo}
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
