"use client";

import {
  Home,
  ShoppingCart,
  User,
  LogOut,
  Package,
  Utensils,
} from "lucide-react";
import Link from "next/link";
import { useContext, useState, useEffect } from "react";
import { CartContext } from "@/context/CartContext";
import { motion } from "framer-motion";
import CartDrawer from "@/components/cart/CartDrawer";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function MobileNav() {
  const { cartItems } = useContext(CartContext);
  const [openCart, setOpenCart] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { logout } = useAuth();
  const [mounted, setMounted] = useState(false);



  const totalItems = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );

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
  useEffect(() => {
    setMounted(true);
  }, []);

  const iconClass = (path: string) =>
    `flex flex-col items-center transition ${pathname === path ? "text-orange-500" : "text-gray-600"
    }`;

  return (
    <>
      <div
  className={`fixed bottom-2 left-1/2 -translate-x-1/2 
  w-[95%] bg-white/95 backdrop-blur-xl shadow-2xl 
  rounded-2xl items-center px-6 py-4 md:hidden z-50 border
  grid ${isLoggedIn ? "grid-cols-6" : "grid-cols-3"}`}
>

        {/* COL 1 */}
<Link href="/" className="flex justify-center">
  <Home size={24} />
</Link>

{/* BEFORE LOGIN STRUCTURE */}
{!isLoggedIn && (
  <>
    {/* COL 2 → CART CENTER */}
    <div className="relative -mt-10 flex justify-center">
      <button
        onClick={() => setOpenCart(true)}
        className="relative bg-orange-500 text-white p-4 rounded-full shadow-xl hover:bg-orange-600 transition"
      >
        <ShoppingCart size={24} />
      </button>
    </div>

    {/* COL 3 */}
    <Link href="/login" className="flex justify-center text-orange-500">
      <User size={24} />
    </Link>
  </>
)}

{/* AFTER LOGIN STRUCTURE */}
{isLoggedIn && (
  <>
    {/* COL 2 */}
    <Link href="/user/booked-tables" className="flex justify-center">
      <Utensils size={22} />
    </Link>

    {/* COL 3 */}
    <Link href="/user/orders" className="flex justify-center">
      <Package size={22} />
    </Link>

    {/* COL 4 → CART EXACT CENTER */}
    <div className="relative -mt-10 flex justify-center">
      <button
        onClick={() => setOpenCart(true)}
        className="relative bg-orange-500 text-white p-4 rounded-full shadow-xl hover:bg-orange-600 transition"
      >
        <ShoppingCart size={24} />
      </button>
    </div>

    {/* COL 5 */}
    <Link href="/user/profile" className="flex justify-center">
      <User size={22} />
    </Link>

    {/* COL 6 */}
    <button onClick={handleLogout} className="flex justify-center">
      <LogOut size={22} />
    </button>

    {/* COL 7 (Optional placeholder for balance symmetry) */}
    <div />
  </>
)}
      </div>

      <CartDrawer
        isOpen={openCart}
        onClose={() => setOpenCart(false)}
      />
    </>
  );
}
