"use client";

import {
  MapPin,
  ShoppingCart,
  User,
  Phone,
  Package,
  LogOut,
  Utensils,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { CartContext } from "@/context/CartContext";
import { LocationContext } from "@/context/LocationContext";
import { motion } from "framer-motion";
import CartDrawer from "@/components/cart/CartDrawer";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  settings?: any;
}

interface HeaderProps {
  settings?: any;
  topOffset?: number;   // 👈 ye line zaroor add ho
}
export default function Header({ settings, topOffset = 0 }: HeaderProps) {
  const { cartItems } = useContext(CartContext);
  const locationCtx = useContext(LocationContext);
  const location = locationCtx?.locationName || locationCtx?.location || "Select Location";

  const pathname = usePathname();
  const router = useRouter();
const { isLoggedIn } = useAuth();
  const [openCart, setOpenCart] = useState(false);
  const [scrolled, setScrolled] = useState(false);
 
 




  /* ================= CART TOTAL ================= */
  const totalItems = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );

  /* ================= SCROLL DETECT ================= */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const iconClass = (path: string) =>
    `p-2 rounded-full transition-all duration-200 ${
      pathname === path
        ? "bg-white text-[#FF6B00]"
        : "text-white hover:bg-white hover:text-[#FF6B00]"
    }`;

  return (
    <>
      <header
  style={{ top: topOffset }}
  className={`w-full transition-all duration-300 z-50
  ${
    scrolled
      ? "fixed bg-linear-to-br from-[#FF6B00] to-[#FF7A00] backdrop-blur-xl shadow-lg"
      : "absolute bg-transparent"
  }`}
>
        {/* ================= DESKTOP ================= */}
        <div className="hidden md:grid grid-cols-3 items-center px-3 py-3">

          {/* LEFT */}
          <div className="flex items-center gap-2 text-white font-medium">
            <Phone size={18} />
            <span className="text-sm">
              {settings?.contactNumber || "+919876543210"}
            </span>
          </div>

          {/* CENTER */}
          <div className="flex justify-center">
            <Link href="/" className="text-3xl font-extrabold tracking-tight font-baloo">
              {settings?.headerLogo ? (
                <img
                  src={settings.headerLogo}
                  alt="SnapKart"
                  className="h-20"
                />
              ) : (
                <>
                  <span className="text-black">Snap</span>
                  <span className="text-white">Kart</span>
                </>
              )}
            </Link>
          </div>

          {/* RIGHT */}
          <div className="flex items-center justify-end gap-4">

            {/* LOCATION - Always Visible */}
            <div className="flex items-center gap-2 text-white font-medium">
              <MapPin size={18} />
              <span className="text-sm">{location}</span>
            </div>

            
                {/* CART */}
                <button
                  onClick={() => setOpenCart(true)}
                  className="relative p-2 rounded-full text-white hover:bg-white hover:text-[#FF6B00]"
                >
                  <ShoppingCart size={24} />
                  {totalItems > 0 && (
                    <motion.span
                      key={totalItems}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className="absolute -top-1 -right-1 bg-white text-[#FF6B00] text-xs px-2 py-0.5 rounded-full"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </button>
                {isLoggedIn ? (
              <>

                {/* BOOKED TABLES */}
                <Link href="/user/booked-tables" className={iconClass("/user/booked-tables")}>
                  <Utensils size={22} />
                </Link>

                {/* ORDERS */}
                <Link href="/user/orders" className={iconClass("/user/orders")}>
                  <Package size={22} />
                </Link>

                {/* PROFILE */}
                <Link href="/user/profile" className={iconClass("/user/profile")}>
                  <User size={22} />
                </Link>

                {/* LOGOUT */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-white hover:bg-red-500 transition"
                >
                  <LogOut size={22} />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-white text-[#FF6B00] rounded-full font-semibold hover:bg-gray-100 transition"
              >
                Login
              </Link>
            )}
          </div>

        </div>

        {/* ================= MOBILE ================= */}
        <div className="md:hidden flex items-center justify-between px-3 py-4">
          <Link href="/" className="text-3xl font-extrabold tracking-tight font-baloo">
            <span className="text-black">Snap</span>
            <span className="text-white">Kart</span>
          </Link>

          <div className="flex items-center gap-2 text-white text-sm font-medium">
            <MapPin size={16} />
            <span>{location}</span>
          </div>
        </div>
      </header>

      <CartDrawer
        isOpen={openCart}
        onClose={() => setOpenCart(false)}
      />
    </>
  );
}
