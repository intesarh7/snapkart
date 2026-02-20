"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function Onboarding() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("snapkart_onboarding_seen");
    if (!seen) {
      setShow(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("snapkart_onboarding_seen", "true");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-100 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.8, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 40 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative text-center"
          >
            <X
              className="absolute top-4 right-4 cursor-pointer hover:scale-110 transition"
              onClick={handleClose}
            />

            <h2 className="text-2xl font-bold mb-4">
              Welcome to SnapKart 🚀
            </h2>

            <p className="text-gray-600 mb-6 leading-relaxed">
              Discover amazing restaurants, exclusive offers, and fast delivery.
              Enjoy seamless ordering with real-time tracking.
            </p>

            <ul className="text-left text-sm text-gray-700 space-y-2 mb-6">
              <li>✔ Live Order Tracking</li>
              <li>✔ Exclusive Offers & Coupons</li>
              <li>✔ Easy Table Booking</li>
              <li>✔ Fast & Reliable Delivery</li>
            </ul>

            <button
              onClick={handleClose}
              className="bg-[#FF6B00] hover:bg-[#e65c00] text-white px-6 py-3 rounded-xl w-full transition font-semibold"
            >
              Get Started
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
