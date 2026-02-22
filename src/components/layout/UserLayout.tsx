"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "./Header";
import Footer from "./Footer";
import MobileNav from "./MobileNav";
import TableBooking from "@/components/user/TableBooking";
import OfferMarquee from "@/components/offers/OfferMarquee";
import Onboarding from "@/components/Onboarding";
import { TableBookingProvider } from "@/context/TableBookingContext";


interface LayoutProps {
  children: React.ReactNode;
  settings?: any;
}

export default function UserLayout({ children, settings }: LayoutProps) {
  const router = useRouter();

  const [touchStartY, setTouchStartY] = useState<number>(0);
  const [touchEndY, setTouchEndY] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [marqueeHeight, setMarqueeHeight] = useState(0);

  useEffect(() => {
  let startY = 0;
  let startX = 0;
  let isPulling = false;

  const threshold = 110; // 👈 how much pull required

  const handleTouchStart = (e: TouchEvent) => {
    if (window.scrollY !== 0) return;
    startY = e.touches[0].clientY;
    startX = e.touches[0].clientX;
    isPulling = true;
  };
  const handleTouchMove = (e: TouchEvent) => {
    if (!isPulling) return;

    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;

    const diffY = currentY - startY;
    const diffX = currentX - startX;

    // ❌ Ignore horizontal swipes
    if (Math.abs(diffX) > Math.abs(diffY)) {
      isPulling = false;
      return;
    }

    // ❌ Ignore upward swipe
    if (diffY < 0) {
      isPulling = false;
      return;
    }
  };

  const handleTouchEnd = () => {
    if (!isPulling) return;

    const diff = window.event
      ? (window.event as any).changedTouches?.[0]?.clientY - startY
      : 0;

    if (diff > threshold && window.scrollY === 0) {
      triggerRefresh();
    }

    isPulling = false;
  };

  const triggerRefresh = async () => {
    setIsRefreshing(true);

    await router.replace(router.asPath);

    setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };

  window.addEventListener("touchstart", handleTouchStart);
  window.addEventListener("touchmove", handleTouchMove);
  window.addEventListener("touchend", handleTouchEnd);

  return () => {
    window.removeEventListener("touchstart", handleTouchStart);
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", handleTouchEnd);
  };
}, [router]);


  useEffect(() => {
    const updateHeight = () => {
      const el = document.getElementById("offer-marquee");
      setMarqueeHeight(el ? el.offsetHeight : 0);
    };

    updateHeight();

    const observer = new MutationObserver(updateHeight);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("resize", updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);


  return (
     
    <TableBookingProvider>
    <div className="min-h-screen flex flex-col bg-gray-50 relative pb-16 md:pb-0">
      {/* 🔄 Refresh Indicator */}
      {isRefreshing && (
        <div className="fixed top-0 left-0 w-full text-center py-2 text-sm font-medium text-white z-50">
          Refreshing...
        </div>
      )}

      <OfferMarquee />

      <div
        style={{ marginTop: marqueeHeight }}
        className="transition-all duration-300 ease-in-out"
      >
        <Header
          settings={settings}
          topOffset={marqueeHeight}
        />
      </div>
      <Onboarding />
      <main className="flex-1">
        {children}
      </main>

      
      <Footer settings={settings} />
      <MobileNav />
    </div>
    </TableBookingProvider>
     
  );
}
