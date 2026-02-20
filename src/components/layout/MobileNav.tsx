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

 const handleLogout = async () => {
  await logout();
  router.push("/login");
};

  useEffect(() => {
  setMounted(true);
}, []);

  const iconClass = (path: string) =>
    `flex flex-col items-center transition ${
      pathname === path ? "text-orange-500" : "text-gray-600"
    }`;

  return (
    <>
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 w-[95%] bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl flex justify-around items-center px-6 py-4 md:hidden z-50 border">

        {/* HOME */}
        <Link href="/" className={iconClass("/")}>
          <Home size={24} />
        </Link>

        {isLoggedIn ? (
          <>
            {/* BOOKED TABLES */}
            <Link
              href="/user/booked-tables"
              className={iconClass("/user/booked-tables")}
            >
              <Utensils size={22} />
            </Link>

            {/* CART CENTER BUTTON */}
            <div className="relative -mt-10">
              <button
                onClick={() => setOpenCart(true)}
                className="relative bg-orange-500 text-white p-4 rounded-full shadow-xl hover:bg-orange-600 transition"
              >
                <ShoppingCart size={24} />

                {mounted && totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={false}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="absolute -top-2 -right-2 bg-black text-white text-[10px] px-2 py-0.5 rounded-full"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </button>
            </div>

            {/* ORDERS */}
            <Link
              href="/user/orders"
              className={iconClass("/user/orders")}
            >
              <Package size={22} />
            </Link>

            {/* PROFILE */}
            <Link
              href="/user/profile"
              className={iconClass("/user/profile")}
            >
              <User size={22} />
            </Link>

            {/* LOGOUT */}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center text-gray-600"
            >
              <LogOut size={22} />
            </button>
          </>
        ) : (
          <>
            {/* LOGIN BUTTON */}
            <Link
              href="/login"
              className="flex flex-col items-center text-orange-500 font-semibold"
            >
              <User size={24} />
            </Link>
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
