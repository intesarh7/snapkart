import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import Seo from "@/components/Seo";
import toast from "react-hot-toast";
import { useEffect, useState, useContext, useRef } from "react";
import { CartContext } from "@/context/CartContext";
import { Star, Search, X, MapPin, ShoppingCart, PackageOpen, Tag, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LocationContext } from "@/context/LocationContext";
import { useTableBooking } from "@/context/TableBookingContext";
import { useRouter } from "next/navigation";
import { getCloudinaryUrl } from "@/lib/cloudinary-url";


interface Restaurant {
  id: string;
  name: string;
}
export default function HomePage() {

  const { addToCart } = useContext(CartContext);
  const { openBooking } = useTableBooking();
  const router = useRouter();
  const locationCtx = useContext(LocationContext);
  const locationName = locationCtx?.locationName;

  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState<"restaurant" | "product">("restaurant");
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [popupOffer, setPopupOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [categories, setCategories] = useState<Category[]>([]);
  const [timeLeft, setTimeLeft] = useState("");
  const [featured, setFeatured] = useState<FeaturedItem[]>([]);
  const [offers, setOffers] = useState<any[]>([]);

  const [showAddressPopup, setShowAddressPopup] = useState(false);

  const formatPrice = (amount: number) => {
    return Math.round(Number(amount || 0));
  };



  interface Category {
    id: number;
    name: string;
    restaurantId: number;
  }

  useEffect(() => {
    const shouldShow = localStorage.getItem("showAddressPopup");
    if (shouldShow === "true") {
      setShowAddressPopup(true);
      localStorage.removeItem("showAddressPopup");
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await axios.get("/api/user/categories");
      setCategories(res.data);
    };

    fetchCategories();
  }, []);

  interface FeaturedItem {
    id: number;
    title: string;
    tag?: string | null;
    price?: number | null;
    image?: string | null;
  }

  useEffect(() => {
    const fetchFeatured = async () => {
      const res = await fetch("/api/user/featured");
      if (!res.ok) {
        console.error("API Error:", res.status);
        return;
      }
      const data = await res.json();

      setFeatured(data);
    };

    fetchFeatured();
  }, []);

  useEffect(() => {
    fetch("/api/user/special-offer")
      .then((res) => res.json())
      .then((data) => setOffers(data));
  }, []);

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resRestaurants, resProducts, resOffers] =
          await Promise.all([
            fetch("/api/user/restaurants"),
            fetch("/api/user/products"),
            fetch("/api/user/offers"),
          ]);

        const restaurantsData = await resRestaurants.json();
        const productsData = await resProducts.json();
        const offersData = await resOffers.json();

        setRestaurants(restaurantsData);
        setProducts(Array.isArray(productsData) ? productsData : productsData.products || []);

        if (offersData?.length > 0) {
          setPopupOffer(offersData[0]);
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowDropdown(false);
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  // OFFER POPUP
  useEffect(() => {
    if (!popupOffer?.expiresAt) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(popupOffer.expiresAt).getTime();
      const distance = expiry - now;

      if (distance <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTimeLeft(); // first run

    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [popupOffer]);



  /* ---------------- FILTERS ---------------- */

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesSearch = r.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const isVisible = r.isActive && r.isOpen;

    return matchesSearch && isVisible;
  });

  const searchResults =
    searchType === "restaurant"
      ? restaurants.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) &&
          r.isActive &&
          r.isOpen
      )
      : products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) &&
          p.isActive &&
          p.isAvailable
      );

  // const categories = [
  //   ...new Set(
  //     products
  //       .filter((p) => p.isActive && p.isAvailable)
  //       .map((p) => p.category)
  //   ),
  // ];

  const filteredProducts =
    selectedCategory === "All"
      ? products.filter(
        (p) => p.isActive && p.isAvailable
      )
      : products.filter(
        (p) =>
          p.category === selectedCategory &&
          p.isActive &&
          p.isAvailable
      );

  /* ===========================
SCROLL ANIMATION VARIANT
============================ */

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };


  /* ---------------- LOADING ---------------- */
  {
    loading && (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-9999">
        <div className="w-12 h-12 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  /* ---------------- UI ---------------- */

  return (
    <>
      <Seo
        title={
          locationName
            ? `Order Online Food in ${locationName} | SnapKart`
            : "Order Online Food Near You | SnapKart"
        }
        description={
          locationName
            ? `Discover top restaurants in ${locationName}. Order food online with fast delivery on SnapKart.`
            : "Discover top restaurants near you. Order food online with fast delivery on SnapKart."
        }
        image="https://yourdomain.com/og-home.jpg"
        url="https://yourdomain.com/"
      />
      <div className="overflow-hidden">

        {/* ================= HERO SECTION ================= */}
        <section className="relative bg-linear-to-br from-[#FF6B00] to-[#FF7A00]
        text-white pt-24 lg:pt-40
          pb-16 sm:pb-20 md:pb-24 lg:pb-28
          hero_bg
          min-h-[75vh] md:min-h-[80vh]
          flex items-center">

          <div className="max-w-7xl mx-auto px-6 text-center">

            <motion.h2
              initial="hidden"
              whileInView="show"
              variants={fadeUp}
              className="font-baloo text-lg sm:text-xl md:text-2xl lg:text-3xl text-white font-medium mb-4 md:mb-5">
              Explore top-rated attractions, activities and more
            </motion.h2>

            <motion.h1
              initial="hidden"
              whileInView="show"
              variants={fadeUp}
              className="font-baloo text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-extrabold leading-tight"
            >
              Fast • Fresh • Reliable

            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              className="mt-4 text-white/80"
            >
              Order food from your favorite restaurants instantly
            </motion.p>

            {/* Search */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              ref={searchRef}
              whileInView="show"
              className="relative max-w-xl mx-auto mt-10"
            >
              <Search size={18} className="absolute left-4 top-4 text-gray-400" />

              <input
                type="text"
                placeholder={
                  searchType === "restaurant"
                    ? "Search restaurant..."
                    : "Search product..."
                }
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="w-full
rounded-full
pl-12 pr-4 sm:pr-6
py-3 sm:py-4
text-black
bg-white
shadow-lg
focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:shadow-xl
transition-all duration-300"
              />

              {/* Toggle Buttons */}
              <div className="flex justify-center gap-3 mt-4">
                <button
                  onClick={() => setSearchType("restaurant")}
                  className={`px-4 py-1 rounded-full text-sm transition ${searchType === "restaurant"
                    ? "bg-black text-white"
                    : "bg-white text-black border"
                    }`}
                >
                  Restaurant
                </button>

                <button
                  onClick={() => setSearchType("product")}
                  className={`px-4 py-1 rounded-full text-sm transition ${searchType === "product"
                    ? "bg-black text-white"
                    : "bg-white text-black border"
                    }`}
                >
                  Product
                </button>
              </div>

              {/* Dropdown */}
              <AnimatePresence>
                {showDropdown && search.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-28 w-full bg-white rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto"
                  >
                    {searchResults.length === 0 && (
                      <div className="p-6 text-gray-500 text-center">
                        No results found
                      </div>
                    )}

                    {searchType === "restaurant" &&
                      searchResults.map((r: any) => (
                        <Link
                          key={r.id}
                          href={`/user/restaurants/${r.id}`}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-4 p-4 hover:bg-gray-50 transition border-b"
                        >
                          <Image
                            src={getCloudinaryUrl(r.image, 200, 200)}
                            alt={r.name}
                            width={80}
                            height={80}
                            className="w-16 h-16 rounded-xl object-cover"
                            loading="lazy"
                          />

                          <div>
                            <h3 className="font-semibold text-gray-900">{r.name}</h3>
                            <p className="text-sm text-gray-500 text-left">
                              {r.address}
                            </p>
                          </div>
                        </Link>
                      ))}

                    {searchType === "product" &&
                      searchResults.map((p: any) => (
                        <Link
                          key={p.id}
                          href={`/user/products/${p.id}`}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-4 p-4 hover:bg-gray-50 transition border-b"
                        >
                          <div className="relative">
                            <Image
                              src={getCloudinaryUrl(p.image, 200, 200)}
                              alt={p.name}
                              width={80}
                              height={80}
                              className="w-16 h-16 rounded-xl object-cover"
                              loading="lazy"
                            />

                            {p.price > p.finalPrice && (
                              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                {Math.round(
                                  ((p.price - p.finalPrice) / p.price) * 100
                                )}
                                % OFF
                              </span>
                            )}
                          </div>

                          <div className="flex-1 text-left">
                            <h3 className="font-semibold  text-gray-900">{p.name}</h3>
                            <p className="text-sm text-gray-900">
                              {p.restaurant?.name}
                            </p>

                            <div className="flex items-center gap-2 mt-1">
                              {p.finalPrice && p.price !== p.finalPrice && (
                                <span className="text-gray-900 line-through text-sm">
                                  ₹{p.price}
                                </span>
                              )}

                              <span className="text-[#FF6B00] font-bold text-lg">
                                ₹{p.finalPrice || p.price}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* category circle */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              className="mt-10"
            >
              <div className="flex flex-wrap justify-center gap-8">
                {categories.map((cat: any) => (
                  <div
                    key={cat.id}
                    onClick={() =>
                      router.push(
                        `/user/restaurants/${cat.restaurantId}?categoryId=${cat.id}`
                      )
                    }
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20
bg-white
rounded-full
flex items-center justify-center
shadow-md
transition-all duration-300 ease-out
group-hover:scale-110 group-hover:shadow-xl
active:scale-95
">
                      <span className="text-lg font-bold text-gray-700 p-2">
                        <Image
                          src={getCloudinaryUrl(cat.image, 200, 200)}
                          alt={cat.name}
                          width={100}
                          height={100}
                          className="object-cover rounded-full"
                        />
                      </span>
                    </div>

                    <p className="mt-3 sm:mt-4
text-white
font-semibold
text-base sm:text-lg md:text-xl
text-center
leading-snug">
                      {cat.name}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
        {/* ================= OFFER CARD ================= */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
        >
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid md:grid-cols-3 gap-8">

                {featured.map((item) => (
                  <div
                    key={item.id}
                    className="relative bg-[#f3ede6] rounded-3xl overflow-hidden p-8 h-70 flex flex-col justify-between shadow-md"
                  >

                    {/* TAG */}
                    {item.tag && (
                      <span className="bg-yellow-400 text-black text-sm font-semibold px-4 py-2 rounded-full w-fit">
                        {item.tag}
                      </span>
                    )}

                    {/* TITLE */}
                    <h3 className="text-3xl font-bold text-black leading-tight">
                      {item.title}
                    </h3>

                    {/* PRICE */}
                    {item.price && (
                      <div className="bg-red-600 text-white font-bold text-lg px-6 py-3 rounded-2xl w-fit">
                        ₹{item.price}
                        <span className="block text-xs font-medium">
                          Only
                        </span>
                      </div>
                    )}

                    {/* IMAGE */}
                    {item.image && (
                      <Image
                        src={getCloudinaryUrl(item.image, 500, 500)}
                        alt={item.title}
                        width={300}
                        height={300}
                        className="absolute bottom-0 right-0 w-44 object-contain"
                        loading="lazy"
                      />
                    )}

                  </div>
                ))}

              </div>
            </div>
            {featured.length === 0 && (
              <div className="flex flex-col items-center justify-center px-4 text-center">
                <div className="bg-red-50 p-6 rounded-full mb-6">
                  <PackageOpen className="w-12 h-12 text-red-500" />
                </div>

                <h2 className="text-xl font-semibold text-gray-800">
                  No Featured Items Found
                </h2>

                <p className="text-gray-500 mt-2 max-w-sm">
                  It looks like there are no featured products available at the moment.
                  Please check back later or explore other categories.
                </p>
              </div>
            )}
          </section>

        </motion.div>


        {/* ================= RESTAURANTS ================= */}
        <section className="max-w-7xl mx-auto px-3 py-10">

          {/* Header */}
          <div className="flex items-center justify-between mb-14">

            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold relative inline-block">
                Most Visited Restaurants
                <span className="absolute -bottom-3 left-0 w-10 h-1 bg-[#FF6B00] rounded-full"></span>
              </h2>
            </div>

            <Link href="/user/restaurants" className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl border border-gray-300 text-sm sm:text-base font-medium bg-white hover:bg-black hover:text-white active:scale-95 focus:outline-none focus:ring-2 focus:ring-black/20 transition-all duration-300 ease-out">
              See All →
            </Link>

          </div>

          {/* ============================= */
            /* Responsive Restaurant Section */
            /* ============================= */}

          {/* 📱 Mobile Scroll */}
          <div className="md:hidden overflow-x-auto pb-4 scrollbar-hide thin-scrollbar scroll-smooth">
            <div className="flex gap-4 w-max">

              {filteredRestaurants.slice(0, 10).map((r) => {
                const rule = r.deliveryRules?.[0];

                return (
                  <motion.div
                    key={r.id}
                    whileHover={{ y: -3 }}
                    className="min-w-65 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
                  >
                    <Link href={`/user/restaurants/${r.id}`}>

                      <div className="relative">
                        <Image
                          src={getCloudinaryUrl(r.image, 800, 500)}
                          alt={r.name}
                          width={800}
                          height={500}
                          className="w-full h-40 object-cover"
                          loading="lazy"
                        />

                        <span className="absolute top-3 left-3 bg-[#FF4D00] text-white text-xs px-2 py-1 rounded-md shadow">
                          {r.addOffer}
                        </span>
                        {/* Top Rated Badge */}
                        <span
                          className={`absolute bottom-4 left-4 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md flex items-center gap-1 ${r.isOpen ? "bg-green-500" : "bg-red-500"
                            }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${r.isOpen ? "bg-white animate-pulse" : "bg-white"
                              }`}
                          ></span>
                          {r.isOpen ? "Open Now" : "Closed"}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-4">

                        {/* Rating + Time */}
                        <div className="flex items-center text-sm text-gray-600 gap-3 mb-2">

                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star size={14} fill="#FACC15" />
                            <span className="font-medium text-gray-800">{r.rating}</span>
                            <span className="text-gray-500">(32)</span>
                          </div>

                          <span className="flex items-center gap-1">
                            • {r.deliveryTime}
                          </span>

                        </div>

                        {/* Name */}
                        <h3 className="font-semibold text-lg mb-1 hover:text-[#FF6B00] transition">
                          {r.name}
                        </h3>

                        {/* Category */}
                        <p className="text-sm text-gray-500">
                          {r.categories}
                        </p>

                        {/* Address */}
                        <p className="flex items-center text-gray-500 text-sm mt-3">
                          <MapPin size={14} className="mr-1" />
                          {r.address}
                        </p>

                        {/* Delivery Rule */}
                        <div className="mt-4 text-sm font-medium text-[#FF6B00]">
                          {rule ? (
                            rule.chargeType === "FREE" ? (
                              rule.maxOrder ? (
                                <>Free Delivery upto ₹{rule.maxOrder}</>
                              ) : (
                                <>Free Delivery</>
                              )
                            ) : (
                              <>Delivery ₹{rule.chargeAmount}</>
                            )
                          ) : (
                            <>Free Delivery</>
                          )}
                        </div>

                      </div>

                    </Link>
                  </motion.div>
                );
              })}

            </div>
          </div>


          {/* 🖥 Desktop & Tablet Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">

            {filteredRestaurants.slice(0, 6).map((r) => {
              const rule = r.deliveryRules?.[0];

              return (
                <motion.div
                  key={r.id}
                  whileHover={{ y: -5 }}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition hover:shadow-lg"
                >
                  <Link href={`/user/restaurants/${r.id}`}>

                    <div className="relative">
                      <Image
                        src={getCloudinaryUrl(r.image, 800, 500)}
                        alt={r.name}
                        width={800}
                        height={500}
                        className="w-full h-44 object-cover"
                        loading="lazy"
                      />

                      {/* Offer Badge */}
                      <span className="absolute top-4 left-4 bg-[#FF4D00] text-white text-xs px-3 py-1 rounded-md font-medium shadow">
                        {r.addOffer}
                      </span>

                      {/* Top Rated Badge */}
                      <span
                        className={`absolute bottom-4 left-4 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md flex items-center gap-1 ${r.isOpen ? "bg-green-500" : "bg-red-500"
                          }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${r.isOpen ? "bg-white animate-pulse" : "bg-white"
                            }`}
                        ></span>
                        {r.isOpen ? "Open Now" : "Closed"}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4">

                      {/* Rating + Time */}
                      <div className="flex items-center text-sm text-gray-600 gap-3 mb-2">

                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star size={14} fill="#FACC15" />
                          <span className="font-medium text-gray-800">{r.rating}</span>
                          <span className="text-gray-500">(32)</span>
                        </div>

                        <span className="flex items-center gap-1">
                          • {r.deliveryTime}
                        </span>

                      </div>

                      {/* Name */}
                      <h3 className="font-semibold text-lg mb-1 hover:text-[#FF6B00] transition">
                        {r.name}
                      </h3>

                      {/* Category */}
                      <p className="text-sm text-gray-500">
                        {r.categories}
                      </p>

                      {/* Address */}
                      <p className="flex items-center text-gray-500 text-sm mt-3">
                        <MapPin size={14} className="mr-1" />
                        {r.address}
                      </p>

                      {/* Delivery Rule */}
                      <div className="mt-4 text-sm font-medium text-[#FF6B00]">
                        {rule ? (
                          rule.chargeType === "FREE" ? (
                            rule.maxOrder ? (
                              <>Free Delivery upto ₹{rule.maxOrder}</>
                            ) : (
                              <>Free Delivery</>
                            )
                          ) : (
                            <>Delivery ₹{rule.chargeAmount}</>
                          )
                        ) : (
                          <>Free Delivery</>
                        )}
                      </div>

                    </div>

                  </Link>
                </motion.div>
              );
            })}

          </div>
        </section>


        {/* ================= TRENDING DISHES ================= */}
        <section className="bg-gray-50 py-10">
          <div className="max-w-7xl mx-auto px-3">

            {/* Header */}
            <div className="flex items-center justify-between mb-14">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold relative inline-block">
                  Super Delicious Deals
                  <span className="absolute -bottom-3 left-0 w-10 h-1 bg-[#FF6B00] rounded-full"></span>
                </h2>
              </div>

              <Link href="/user/products" className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl border border-gray-300 text-sm sm:text-base font-medium bg-white hover:bg-black hover:text-white active:scale-95 focus:outline-none focus:ring-2 focus:ring-black/20 transition-all duration-300 ease-out">
                View All
              </Link>
            </div>

            {/* Products Grid */}
            {/* =============================== */}
{/* 📱 Mobile Horizontal Scroll */}
{/* =============================== */}

<div className="md:hidden overflow-x-auto pb-4 thin-scrollbar scroll-smooth">
  <div className="flex gap-6 w-max">

    {filteredProducts.slice(0, 8).map((p) => {

      const hasVariants = p.variants && p.variants.length > 0;

      const startingPrice = hasVariants
        ? Math.min(...p.variants.map((v: any) => v.price))
        : p.price;

      const startingFinalPrice = hasVariants
        ? Math.min(...p.variants.map((v: any) => v.finalPrice || v.price))
        : p.finalPrice;

      const hasDiscount = startingFinalPrice < startingPrice;

      const discountPercent = hasDiscount
        ? Math.round(
            ((startingPrice - startingFinalPrice) / startingPrice) * 100
          )
        : 0;

      const reviewCount = p.reviewCount || 0;
      const deliveryTime =
        p.restaurant?.deliveryTime || "30-40 mins";

      return (
        <motion.div
          key={p.id}
          whileHover={{ y: -5 }}
          className="min-w-65 bg-white border border-gray-200 rounded-2xl overflow-hidden transition hover:shadow-lg"
        >
          <Link href={`/user/products/${p.id}`}>
            <div className="relative">

              <Image
                src={getCloudinaryUrl(p.image, 800, 500)}
                alt={p.name}
                width={800}
                height={500}
                className="w-full h-44 object-cover"
                loading="lazy"
              />

              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {p.offerType && p.offerValue > 0 && (
                  <span className="bg-[#FF4D00] text-white text-xs px-3 py-1 rounded-md font-medium shadow">
                    {p.offerType.toLowerCase() === "percentage"
                      ? `OFFER ${p.offerValue}%`
                      : `OFFER ₹${p.offerValue}`}
                  </span>
                )}

                {p.extraType && p.extraValue > 0 && (
                  <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-md font-medium shadow">
                    {p.extraType.toLowerCase() === "percentage"
                      ? `BINGO OFFER ${p.extraValue}%`
                      : `BINGO OFFER ₹${p.extraValue}`}
                  </span>
                )}
              </div>

            </div>

            <div className="p-4">
              <h3 className="font-semibold text-base mb-1 hover:text-[#FF6B00] transition">
                {p.name}
              </h3>

              <div className="flex items-center text-sm text-gray-600 gap-2 mb-2">
                <Star size={14} fill="#FACC15" />
                <span>{p.rating?.toFixed(1) || "0.0"}</span>
                <span>({reviewCount})</span>
              </div>

              <div className="text-lg font-bold text-[#FF6B00]">
                ₹{formatPrice(startingFinalPrice)}
              </div>
            </div>

          </Link>
        </motion.div>
      );
    })}

  </div>
</div>


{/* =============================== */}
{/* 🖥 Desktop & Tablet Grid */}
{/* =============================== */}

<div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

  {filteredProducts.slice(0, 6).map((p) => {

    const hasVariants = p.variants && p.variants.length > 0;

    const startingPrice = hasVariants
      ? Math.min(...p.variants.map((v: any) => v.price))
      : p.price;

    const startingFinalPrice = hasVariants
      ? Math.min(...p.variants.map((v: any) => v.finalPrice || v.price))
      : p.finalPrice;

    const hasDiscount = startingFinalPrice < startingPrice;

    const discountPercent = hasDiscount
      ? Math.round(
          ((startingPrice - startingFinalPrice) / startingPrice) * 100
        )
      : 0;

    const reviewCount = p.reviewCount || 0;
    const deliveryTime =
      p.restaurant?.deliveryTime || "30-40 mins";

    return (
      <motion.div
        key={p.id}
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        whileHover={{ y: -5 }}
        className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition hover:shadow-lg"
      >
        <Link href={`/user/products/${p.id}`}>

          <div className="relative">

            <Image
              src={getCloudinaryUrl(p.image, 800, 500)}
              alt={p.name}
              width={800}
              height={500}
              className="w-full h-52 object-cover"
              loading="lazy"
            />

            <div className="absolute top-4 left-4 flex flex-col gap-2">

              {p.offerType && p.offerValue > 0 && (
                <span className="bg-[#FF4D00] text-white text-xs px-3 py-1 rounded-md font-medium shadow">
                  {p.offerType.toLowerCase() === "percentage"
                    ? `OFFER ${p.offerValue}%`
                    : `OFFER ₹${p.offerValue}`}
                </span>
              )}

              {p.extraType && p.extraValue > 0 && (
                <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-md font-medium shadow">
                  {p.extraType.toLowerCase() === "percentage"
                    ? `BINGO OFFER ${p.extraValue}%`
                    : `BINGO OFFER ₹${p.extraValue}`}
                </span>
              )}

            </div>

          </div>

          <div className="p-5">

            <div className="flex items-center text-sm text-gray-600 gap-3 mb-2">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star size={14} fill="#FACC15" />
                <span className="font-medium text-gray-800">
                  {p.rating?.toFixed(1) || "0.0"}
                </span>
                <span className="text-gray-500">
                  ({reviewCount})
                </span>
              </div>

              <span>• {deliveryTime}</span>
            </div>

            <h3 className="font-semibold text-lg mb-1 hover:text-[#FF6B00] transition">
              {p.name}
            </h3>

            <p className="text-sm text-gray-500">
              {p.category}
            </p>

            <p className="text-sm text-gray-500 mt-1">
              {p.restaurant?.name}
            </p>

            <p className="flex items-center text-gray-500 text-sm mt-2">
              <MapPin size={14} className="mr-1" />
              {p.restaurant?.address || "Location not available"}
            </p>

            {hasVariants && (
              <p className="text-xs text-gray-500 mt-2">
                {p.variants.length} Sizes Available
              </p>
            )}

            <div className="flex items-center justify-between mt-4">

              <div>
                {hasDiscount && (
                  <span className="text-gray-400 line-through text-sm mr-2">
                    ₹{formatPrice(startingPrice)}
                  </span>
                )}

                <span className="text-lg font-bold text-[#FF6B00]">
                  ₹{formatPrice(startingFinalPrice)}
                </span>

                {hasDiscount && (
                  <span className="text-green-600 text-xs ml-2 font-medium">
                    {discountPercent}% OFF
                  </span>
                )}

                {hasVariants && (
                  <span className="text-xs text-gray-500 ml-2">
                    (Starts from)
                  </span>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  addToCart({
                    id: p.id,
                    name: p.name,
                    price: hasVariants ? p.variants[0].price : startingPrice,
                    finalPrice: hasVariants
                      ? p.variants[0].finalPrice || p.variants[0].price
                      : startingFinalPrice,
                    image: p.image,
                    restaurantId: p.restaurantId,
                    variantId: hasVariants ? p.variants[0].id : null,
                    variantName: hasVariants ? p.variants[0].name : null,
                    hasVariants: hasVariants,
                    extras: [],
                    variants: p.variants || [],
                    availableExtras: p.extras || [],
                  });

                  toast.success("Added to cart 🛒");
                }}
                className="flex items-center gap-2 bg-[#FF6B00] text-white px-4 py-2 rounded-xl hover:bg-orange-600 transition text-sm"
              >
                <ShoppingCart size={16} />
                Add
              </button>

            </div>

          </div>

        </Link>
      </motion.div>
    );
  })}

</div>

          </div>
        </section>


        {/* ================= BIG PROMO STATIC SECTION ================= */}
        {offers.map((offer) => (
          <section key={offer.id} className="relative h-100 flex items-center mb-10 overflow-hidden">

            <Image
              src={getCloudinaryUrl(offer.image, 1600, 900)}
              alt={offer.title}
              fill
              className="object-cover"
              priority={false}
            />

            <div className="absolute inset-0 bg-black/60"></div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 text-white">
              <h2 className="text-4xl font-bold mb-3">
                {offer.title}
              </h2>

              {offer.priceText && (
                <p className="text-lg mb-6">
                  {offer.priceText}
                </p>
              )}

              {offer.buttonText && (
                <a
                  // href={offer.buttonLink || "#"}
                  href="user/products"
                  className="bg-orange-600 px-6 py-3 rounded-xl text-white font-semibold"
                >
                  {offer.buttonText}
                </a>
              )}
            </div>
          </section>
        ))}

        {/* ================= OFFER POPUP ================= */}
        <AnimatePresence>
          {popupOffer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                transition={{ type: "spring", stiffness: 120 }}
                className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
              >
                {/* Gradient Header */}
                <div className="bg-linear-to-r from-[#FF6B00] to-[#FF3D00] text-white p-6 text-center relative">
                  <X
                    className="absolute top-4 right-4 cursor-pointer hover:scale-110 transition text-black"
                    onClick={() => setPopupOffer(null)}
                  />

                  <div className="flex justify-center mb-3">
                    <div className="bg-white/20 p-3 rounded-full">
                      <Tag className="w-8 h-8" />
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold">
                    {popupOffer.title}
                  </h2>

                  {popupOffer.type && (
                    <p className="mt-2 text-lg font-semibold">
                      {popupOffer.type === "Percentage"
                        ? `${popupOffer.value}% OFF`
                        : `₹${popupOffer.value} OFF`}
                    </p>
                  )}
                </div>

                {/* Body */}
                <div className="p-6 text-center space-y-4">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {popupOffer.description}
                  </p>

                  {/* Timer */}
                  {timeLeft && (
                    <div className="flex items-center justify-center gap-2 bg-gray-100 rounded-xl py-3">

                      <span className="font-semibold text-gray-800">
                        <span className="w-5 h-5 text-[#FF6B00]"> ⏳Ends in:</span> {timeLeft}
                      </span>
                    </div>
                  )}

                  {/* Active Badge */}
                  {popupOffer.active && (
                    <span className="inline-block bg-green-100 text-green-600 text-xs px-3 py-1 rounded-full font-medium">
                      Active Offer
                    </span>
                  )}

                  <button
                    onClick={() => setPopupOffer(null)}
                    className="w-full mt-4 bg-[#FF6B00] hover:bg-[#e65c00] transition text-white py-3 rounded-2xl font-semibold shadow-lg"
                  >
                    Shop Now
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* ================= TABLE BOOKING CLOUD SECTION ================= */}

        <section className="relative py-20 bg-linear-to-br from-orange-50 via-white to-orange-100 overflow-hidden">

          <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-yellow-200 rounded-full blur-3xl opacity-30"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-6">

            {/* Section Header */}
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold">
                Reserve Your Table
              </h2>
              <p className="text-gray-500 mt-2">
                Choose your favorite restaurant and book instantly
              </p>
            </div>

            {/* Cloud Button Grid */}
            <div className="flex flex-wrap justify-center gap-4">

              {restaurants
                .filter((r) => r.isActive)
                .map((r) => (
                  <button
                    key={r.id}
                    onClick={() => openBooking(r.id)}
                    disabled={!r.isOpen}
                    className={`
            group relative
            px-6 py-3
            rounded-full
            text-sm md:text-base
            font-semibold
            transition-all duration-300
            shadow-md
            border
            ${r.isOpen
                        ? "bg-white text-gray-800 border-gray-200 hover:bg-[#FF6B00] hover:text-white hover:shadow-lg hover:-translate-y-1"
                        : "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed"}
          `}
                  >
                    <span className="flex items-center gap-2">

                      {/* Restaurant Name */}
                      {r.name}

                      {/* Status Dot */}
                      <span
                        className={`
                w-2 h-2 rounded-full
                ${r.isOpen ? "bg-green-500 animate-pulse" : "bg-red-500"}
              `}
                      />
                    </span>

                    {/* Floating Glow Effect */}
                    {r.isOpen && (
                      <span className="absolute inset-0 rounded-full bg-[#FF6B00] opacity-0 group-hover:opacity-10 transition" />
                    )}
                  </button>
                ))}

            </div>
          </div>

        </section>


        {showAddressPopup && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">

              <h2 className="text-lg font-semibold text-gray-800">
                Address Required
              </h2>

              <p className="text-sm text-gray-600 mt-2">
                You haven’t added a delivery address yet.
                Please add your address before placing an order.
              </p>

              <div className="flex justify-end gap-3 mt-6">

                <button
                  onClick={() => setShowAddressPopup(false)}
                  className="px-4 py-2 text-sm rounded-lg border"
                >
                  Later
                </button>

                <button
                  onClick={() => router.push("/user/profile")}
                  className="px-4 py-2 text-sm rounded-lg bg-orange-500 text-white"
                >
                  Add Address
                </button>

              </div>

            </div>
          </div>
        )}
      </div>
    </>
  );
}
