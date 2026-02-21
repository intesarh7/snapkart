import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { Lock, Mail } from "lucide-react";

export default function Login() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    if (!form.email) {
      setErrors({ email: "Email is required" });
      setLoading(false);
      return;
    }

    if (!form.password) {
      setErrors({ password: "Password is required" });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ general: data.message || "Login failed" });
        setLoading(false);
        return;
      }

      // 🔍 After successful login
      if (data.role === "USER") {

        // ✅ Address check API call
        const addressRes = await fetch("/api/user/address/check", {
          credentials: "include",
        });

        const addressData = await addressRes.json();

        // ❌ If address not filled
        if (!addressData.hasAddress) {
          localStorage.setItem("showAddressPopup", "true");
        }

        router.replace("/");

      } else if (data.role === "ADMIN") {
        router.replace("/admin");

      } else if (data.role === "DELIVERY") {
        router.replace("/delivery/dashboard");
      }

    } catch (error) {
      setErrors({ general: "Something went wrong" });
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 bg-linear-to-br from-orange-50 to-orange-100">

      {/* Background Pattern with Opacity */}
      <div className="absolute inset-0 bg-[url('/images/bg-pattern.png')] bg-repeat [bg-size:900px_900px] opacity-18 pointer-events-none"></div>


      {/* LEFT FOOD IMAGE */}
      <div className="hidden lg:block absolute -left-20 top-0">
        <Image
          src="/images/food-left.png"   // 🔁 Replace with your PNG
          alt="Food"
          width={300}
          height={300}
          className="opacity-90"
        />
      </div>

      {/* RIGHT FOOD IMAGE */}
      <div className="hidden lg:block absolute -right-20 top-10">
        <Image
          src="/images/food-right.png"  // 🔁 Replace with your PNG
          alt="Food"
          width={300}
          height={300}
          className="opacity-90"
        />
      </div>



      {/* LOGIN CARD */}
      <div className="bg-white/90 backdrop-blur-lg w-full max-w-md p-8 rounded-3xl shadow-2xl border border-white">
        {/* LOGO IMAGE */}
        <div className="lg:block">
          <Link href="/">
           
          <Image
            src="/logo.png"   // 🔁 Replace with your PNG
            alt="Food"
            width={100}
            height={100}
            className="opacity-90 m-auto mb-5"
          />
          </Link>
        </div>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Login
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back to <span className="font-semibold text-orange-600">SnapKart</span>
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">

          {/* EMAIL */}
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                type="email"
                placeholder="Enter Email Address"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className={`w-full pl-10 pr-3 py-3 rounded-xl border bg-gray-50 focus:outline-none focus:ring-2 transition ${errors.email
                    ? "border-red-500 focus:ring-red-400"
                    : "focus:ring-orange-500"
                  }`}
              />
            </div>

            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                className={`w-full pl-10 pr-3 py-3 rounded-xl border bg-gray-50 focus:outline-none focus:ring-2 transition ${errors.password
                    ? "border-red-500 focus:ring-red-400"
                    : "focus:ring-orange-500"
                  }`}
              />
            </div>

            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* ERROR */}
          {errors.general && (
            <div className="bg-red-100 text-red-600 p-2 rounded-lg text-sm text-center">
              {errors.general}
            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 transition text-white p-3 rounded-xl font-semibold shadow-md disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link href="/register" className="text-orange-600 font-semibold hover:underline">
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}