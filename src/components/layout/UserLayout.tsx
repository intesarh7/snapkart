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
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        setTouchStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      setTouchEndY(e.touches[0].clientY);
    };

    const handleTouchEnd = async () => {
      if (window.scrollY === 0 && touchEndY - touchStartY > 120) {
        setIsRefreshing(true);

        // 🔥 Soft Refresh (no full reload)
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
    <div className="min-h-screen flex flex-col bg-gray-50 relative">
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
