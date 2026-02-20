import Link from "next/link";
import { useEffect, useState } from "react";
import { Facebook, Instagram, Twitter, Send } from "lucide-react";
import toast from "react-hot-toast";

interface FooterProps {
  settings?: any;
}

export default function Footer({ settings }: FooterProps) {
  const [year, setYear] = useState<number | null>(null);

  const [email, setEmail] = useState("");

  const handleSubscribe = async () => {
    if (!email) {
      toast.error("Please enter email ❌");
      return;
    }

    const res = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (data.success) {
      toast.success("Thank you for subscribing! 🎉");
      setEmail("");
    } else {
      toast.error(data.message || "Already subscribed");
    }
  };

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="hidden md:block bg-[#111111] text-white pt-20 pb-10 mt-20">

      <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-4 gap-12">

        {/* ================= BRAND ================= */}
        <div>
          {settings?.footerLogo ? (
            <img
              src={settings.footerLogo}
              alt="SnapKart"
              className="h-10 mb-4"
            />
          ) : (
            <h2 className="text-3xl font-extrabold mb-4">
              <span className="text-white">Snap</span>
              <span className="text-[#FF6B00]">Kart</span>
            </h2>
          )}

          <p className="text-gray-400 text-sm leading-relaxed">
            {settings?.footerInfo ||
              "Fast delivery, zero hassle. Order from your favorite restaurants and get food delivered to your doorstep instantly."}
          </p>

          <div className="flex gap-4 mt-6">
              {settings?.facebook && (
                <Link href={settings.facebook} target="_blank">
                  <Facebook className="hover:text-[#FF6B00] cursor-pointer transition" />
                </Link>
              )}
              {settings?.instagram && (
                <Link href={settings.instagram} target="_blank">
                  <Instagram className="hover:text-[#FF6B00] cursor-pointer transition" />
                </Link>
              )}
              {settings?.twitter && (
                <Link href={settings.twitter} target="_blank">
                  <Twitter className="hover:text-[#FF6B00] cursor-pointer transition" />
                </Link>
              )}
            </div>
        </div>

        {/* ================= QUICK LINKS ================= */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Quick Links
          </h3>

          <ul className="space-y-3 text-gray-400 text-sm">
            <li>
              <Link href="/" className="hover:text-[#FF6B00] transition">
                Home
              </Link>
            </li>
            <li>
              <Link href="/user/profile" className="hover:text-[#FF6B00] transition">
                My Account
              </Link>
            </li>
            <li>
              <Link href="/user/orders" className="hover:text-[#FF6B00] transition">
                Orders
              </Link>
            </li>
            <li>
              <Link href="/pages/contact" className="hover:text-[#FF6B00] transition">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* ================= INFORMATION ================= */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Information
          </h3>

          <ul className="space-y-3 text-gray-400 text-sm">
            <li>
              <Link
                href="/pages/privacy-policy"
                className="hover:text-[#FF6B00] transition"
              >
                Privacy Policy
              </Link>
            </li>

            <li>
              <Link
                href="/pages/terms-conditions"
                className="hover:text-[#FF6B00] transition"
              >
                Terms & Conditions
              </Link>
            </li>

            <li>
              <Link
                href="/pages/refund-policy"
                className="hover:text-[#FF6B00] transition"
              >
                Refund Policy
              </Link>
            </li>

            <li>
              <Link
                href="/pages/help-center"
                className="hover:text-[#FF6B00] transition"
              >
                Help Center
              </Link>
            </li>
          </ul>
        </div>

        {/* ================= NEWSLETTER ================= */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Subscribe
          </h3>

          <p className="text-gray-400 text-sm mb-4">
            Subscribe to get special offers and updates.
          </p>

          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-white/10 border border-white/20 rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500"
            />

            <button
              onClick={handleSubscribe}
              className="absolute right-1 top-1 bg-orange-500 hover:bg-orange-600 transition p-2.5 rounded-full"
            >
              <Send size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* ================= BOTTOM COPYRIGHT ================= */}
      <div className="border-t border-white/10 mt-16 pt-6 text-center text-gray-500 text-sm">
        © {year || ""} SnapKart. All rights reserved.
      </div>

    </footer>
  );
}
