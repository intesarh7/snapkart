"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [touchStartY, setTouchStartY] = useState<number>(0);
  const [touchEndY, setTouchEndY] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        setTouchStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      setTouchEndY(e.touches[0].clientY);
    };

    const handleTouchEnd = async () => {
      // 🔥 Admin me accidental refresh avoid karne ke liye threshold 150px
      if (window.scrollY === 0 && touchEndY - touchStartY > 150) {
        setIsRefreshing(true);

        // Soft refresh (no hard reload)
        router.replace(router.asPath);

        setTimeout(() => {
          setIsRefreshing(false);
        }, 800);
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [touchStartY, touchEndY, router]);

  return (
    <div className="flex relative">
      {/* 🔄 Refresh Indicator */}
      {isRefreshing && (
        <div className="fixed top-0 left-0 w-full text-center py-2 text-sm font-medium text-white z-50">
          Refreshing...
        </div>
      )}

      <AdminSidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        <AdminHeader />

        <main className="flex-1 p-6 bg-gray-50">
          {children}
        </main>

        <AdminFooter />
      </div>
    </div>
  );
}
