import type { AppProps, AppContext } from "next/app";
import App from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Script from "next/script";
import Head from "next/head";

import { prisma } from "@/lib/prisma";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { AuthProvider } from "@/context/AuthContext";

import "leaflet/dist/leaflet.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/baloo-bhai-2/400.css";
import "@fontsource/baloo-bhai-2/500.css";
import "@fontsource/baloo-bhai-2/600.css";
import "@fontsource/baloo-bhai-2/700.css";
import "@fontsource/baloo-bhai-2/800.css";
import "@/styles/globals.css";

import UserLayout from "@/components/layout/UserLayout";
import AdminLayout from "@/components/admin/AdminLayout";
import DeliveryLayout from "@/components/delivery/DeliveryLayout";
import AuthLayout from "@/components/layout/AuthLayout";
import { CartProvider } from "@/context/CartContext";
import { LocationProvider } from "@/context/LocationContext";
import ClientToaster from "@/components/ui/ClientToaster";

/* ✅ Proper Extended PageProps */
interface ExtendedPageProps {
  settings?: any;
}

/* ✅ AppProps Generic Extension */
interface MyAppProps extends AppProps<ExtendedPageProps> { }

export default function MyApp({
  Component,
  pageProps,
}: MyAppProps) {
  const router = useRouter();
  const path = router.pathname;
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const isAdmin = path.startsWith("/admin");
  const isDelivery = path.startsWith("/delivery");
  const isAuth =
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/forgot-password");

  type LayoutType = React.ComponentType<{
    children: React.ReactNode;
    settings?: any;
  }>;

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      setSettings(data);
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    const handleStart = () => {
      setLoading(true);
      NProgress.start();
    };

    const handleComplete = () => {
      setLoading(false);
      NProgress.done();
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  let Layout: LayoutType = UserLayout;

  if (isAdmin) Layout = AdminLayout;
  if (isDelivery) Layout = DeliveryLayout;
  if (isAuth) Layout = AuthLayout;

  return (
    <>
      {/* Global Head */}
      <Head>
        <title>SnapKart | Online Food Delivery</title>
        <meta
          name="description"
          content="SnapKart is a fast and reliable online food delivery platform. Order from your favorite restaurants and track your delivery in real-time."
        />
        <meta
          name="keywords"
          content="SnapKart, food delivery, online food ordering, restaurant delivery, order food online, real-time tracking"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content="SnapKart" />
        <meta name="theme-color" content="#111827" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:site_name" content="SnapKart" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      {/* Cashfree SDK */}
      <Script
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        strategy="afterInteractive"
      />

      {loading && (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-[9999]">
          <div className="w-12 h-12 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <AuthProvider>
      <LocationProvider>
        <CartProvider>
          {/* ✅ settings now comes from pageProps */}
          <Layout settings={settings}>
            <Component {...pageProps} />
            <ClientToaster />
          </Layout>
        </CartProvider>
      </LocationProvider>
      </AuthProvider>
    </>
  );
}

