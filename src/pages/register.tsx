import { useState, useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { Lock, Mail, Phone, User } from "lucide-react";


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- VALIDATION ---------------- */

  const validate = () => {
    const newErrors: any = {};

    if (form.name.trim().length < 2)
      newErrors.name = "Name must be at least 2 characters";

    if (!EMAIL_REGEX.test(form.email))
      newErrors.email = "Invalid email format";

    if (!PHONE_REGEX.test(form.phone))
      newErrors.phone = "Invalid phone number";

    if (!PASSWORD_REGEX.test(form.password))
      newErrors.password =
        "Min 8 chars with uppercase, lowercase & number";

    return newErrors;
  };

  const isValid = useMemo(() => {
    return (
      form.name &&
      form.email &&
      form.phone &&
      form.password &&
      Object.keys(validate()).length === 0
    );
  }, [form]);

  /* ---------------- HANDLE CHANGE ---------------- */

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
    setErrors({ ...errors, [field]: "" });
    setFormError("");
  };

  /* ---------------- SUBMIT ---------------- */

  const handleRegister = async () => {
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.message || "Registration failed");
        return;
      }

      router.push("/login");
    } catch {
      setFormError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
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

        <h2 className="text-2xl font-bold mb-6 text-center">
          Create Account
        </h2>

        {/* Global Error */}
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {formError}
          </div>
        )}

        {/* Name */}
        <div className="mb-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

            <input
              placeholder="Full Name"
              value={form.name}
              onChange={(e) =>
                handleChange("name", e.target.value)
              }
              className={`w-full pl-10 pr-3 py-2 rounded-lg border bg-gray-50 focus:outline-none focus:ring-2 transition ${errors.name
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-orange-300"
                }`}
            />
          </div>

          {errors.name && (
            <p className="text-red-500 text-xs mt-1">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="mb-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                handleChange("email", e.target.value)
              }
              className={`w-full pl-10 pr-3 py-2 rounded-lg border bg-gray-50 focus:outline-none focus:ring-2 transition ${errors.email
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-orange-300"
                }`}
            />
          </div>

          {errors.email && (
            <p className="text-red-500 text-xs mt-1">
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="mb-4">
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) =>
                handleChange("phone", e.target.value)
              }
              className={`w-full pl-10 pr-3 py-2 rounded-lg border bg-gray-50 focus:outline-none focus:ring-2 transition ${errors.phone
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-orange-300"
                }`}
            />
          </div>

          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="mb-6">
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />

            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                handleChange("password", e.target.value)
              }
              className={`w-full pl-10 pr-3 py-2 rounded-lg border bg-gray-50 focus:outline-none focus:ring-2 transition ${errors.password
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-orange-300"
                }`}
            />
          </div>

          {/* Hint Text */}
          <p className="text-gray-500 text-xs mt-2 leading-relaxed">
            • Minimum 8 characters <br />
            • At least one uppercase letter <br />
            • At least one lowercase letter <br />
            • At least one number
          </p>

          {errors.password && (
            <p className="text-red-500 text-xs mt-2">
              {errors.password}
            </p>
          )}
        </div>

        {/* Button */}
        <button
          onClick={handleRegister}
          disabled={!isValid || loading}
          className={`w-full py-2 rounded-lg font-semibold transition ${!isValid || loading
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-orange-600 hover:bg-orange-700 text-white"
            }`}
        >
          {loading ? "Creating Account..." : "Register"}
        </button>

        <p className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-orange-600 font-medium"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}