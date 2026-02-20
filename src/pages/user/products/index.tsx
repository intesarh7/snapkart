// pages/user/products/index.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Star, ShoppingCart, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useContext } from "react";
import { CartContext } from "@/context/CartContext";
import Seo from "@/components/Seo";
import { LocationContext } from "@/context/LocationContext";

export default function ProductListPage() {
  const router = useRouter();
  const { addToCart } = useContext(CartContext);

  const locationCtx = useContext(LocationContext);
  const locationName = locationCtx?.locationName;

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 8;


  const dynamicTitle =
    selectedCategory && selectedCategory !== "All"
      ? locationName
        ? `${selectedCategory} in ${locationName} | Order Online | SnapKart`
        : `${selectedCategory} | Order Online | SnapKart`
      : locationName
        ? `All Food Items in ${locationName} | SnapKart`
        : "All Food Items | SnapKart";



  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory, sort]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(
        `/api/user/products?page=${page}&limit=${limit}&category=${selectedCategory}&sort=${sort}`
      );
      const data = await res.json();
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setCategories(data.categories);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Seo
        title={dynamicTitle}
        description={
          locationName
            ? `Explore delicious food items in ${locationName}. Browse menu, compare prices & order instantly on SnapKart.`
            : "Explore delicious food items near you. Browse menu, compare prices & order instantly on SnapKart."
        }
        image="https://yourdomain.com/og-products.jpg"
        url="https://yourdomain.com/user/products"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: products?.map((p: any, index: number) => ({
              "@type": "ListItem",
              position: index + 1,
              name: p.name,
              url: `https://yourdomain.com/user/products/${p.id}`,
            })),
          }),
        }}
      />
      <div className="min-h-screen bg-linear-to-b from-orange-50 to-white">
        {/* ===== Small Header Section ===== */}
        <div className="mb-10">
          <div className="bg-linear-to-r from-orange-500 to-orange-600 h-60 flex flex-col justify-end  py-8 px-6 text-center shadow-lg relative overflow-hidden">

            {/* Soft background glow */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white,transparent_70%)]"></div>

            <h1 className="text-2xl md:text-3xl font-bold text-white relative z-10">
              All Items List
            </h1>

          </div>
        </div>
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="bg-white/90 backdrop-blur border-b- sticky top-0 z-40 mb-8 rounded-xl shadow-sm">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm font-medium text-[#FF6B00] hover:text-[#FF6B00] transition"
              >
                <ArrowLeft size={18} />
                Back
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-5 mb-8">

            <div className="flex flex-wrap gap-3">
              {["All", ...categories].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setPage(1);
                  }}
                  className={`px-4 py-1.5 rounded-full border text-sm transition ${selectedCategory === cat
                      ? "bg-linear-to-r from-[#FF6B00] to-orange-600 text-white border-[#FF6B00] shadow"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#FF6B00]"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border border-gray-200 px-4 py-2 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 outline-none bg-white shadow-sm"
            >
              <option value="latest">Latest</option>
              <option value="priceLow">Price Low → High</option>
              <option value="priceHigh">Price High → Low</option>
              <option value="rating">Top Rated</option>
            </select>

          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-8">

            {products.map((p) => {

              const hasVariants = p.variants && p.variants.length > 0;

              const startingPrice = hasVariants
                ? Math.min(...p.variants.map((v: any) => v.price))
                : p.price;

              const startingFinalPrice = hasVariants
                ? Math.min(
                  ...p.variants.map((v: any) => v.finalPrice || v.price)
                )
                : p.finalPrice;

              const hasDiscount = startingFinalPrice < startingPrice;

              const discountPercent = hasDiscount
                ? Math.round(
                  ((startingPrice - startingFinalPrice) /
                    startingPrice) *
                  100
                )
                : 0;

              return (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -6 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition duration-300 border border-gray-100"
                >
                  <Link href={`/user/products/${p.id}`}>

                    {/* ================= IMAGE SECTION ================= */}
                    <div className="relative">

                      <img
                        src={p.image || "/placeholder.jpg"}
                        className="w-full h-44 md:h-52 object-cover"
                      />

                      {/* Main Offer Badge */}
                      {p.offerType && p.offerValue > 0 && (
                        <div className="absolute top-3 left-4 bg-white text-[#FF6B00] text-xs font-semibold px-3 py-1 rounded-full shadow">
                          {p.offerType === "PERCENTAGE"
                            ? `${p.offerValue}% OFF`
                            : `₹${p.offerValue} OFF`}
                        </div>
                      )}

                      {/* Extra Offer Badge */}
                      {p.extraType && p.extraValue > 0 && (
                        <div className="absolute top-3 right-3 bg-[#FF6B00] text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                          {p.extraType === "PERCENTAGE"
                            ? `Extra ${p.extraValue}%`
                            : `Extra ₹${p.extraValue}`}
                        </div>
                      )}

                      {/* ⭐ Rating Bottom Right */}
                      <div className="absolute bottom-0 right-3 bg-white/95 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <Star size={14} fill="#FACC15" />
                        <span className="text-xs font-semibold text-gray-800">
                          {p.rating?.toFixed(1) || "0.0"}
                        </span>
                      </div>

                    </div>

                    {/* ================= CONTENT ================= */}
                    <div className="p-5">

                      <h3 className="font-semibold text-base md:text-lg text-gray-800 truncate">
                        {p.name}
                      </h3>

                      <p className="text-xs text-gray-500 truncate mt-1">
                        {p.restaurant?.name}
                      </p>

                      {hasVariants && (
                        <p className="text-xs text-gray-400 mt-2">
                          {p.variants.length} Sizes Available
                        </p>
                      )}

                      {/* PRICE + ADD */}
                      <div className="flex items-center justify-between mt-4">

                        <div>
                          {hasDiscount && (
                            <span className="text-gray-400 line-through text-sm mr-2">
                              ₹{Math.round(startingPrice)}
                            </span>
                          )}

                          <span className="text-xl font-bold text-[#FF6B00]">
                            ₹{Math.round(startingFinalPrice)}
                          </span>

                          {hasVariants && (
                            <span className="text-xs text-gray-500 ml-2">
                              Starts from
                            </span>
                          )}

                          {hasDiscount && (
                            <span className="text-green-600 text-xs ml-2 font-medium">
                              {discountPercent}% OFF
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
                              price: startingPrice,
                              finalPrice: startingFinalPrice,
                              image: p.image,
                              restaurantId: p.restaurantId,

                              variantId: hasVariants
                                ? p.variants[0].id
                                : null,

                              variantName: hasVariants
                                ? p.variants[0].name
                                : null,

                              hasVariants,
                              variants: p.variants || [],
                              availableExtras: p.extras || [],
                              extras: [],
                            });

                            toast.success("Added to cart 🛒");
                          }}
                          className="bg-[#FF6B00] text-white px-4 py-2 rounded-xl hover:bg-orange-600 transition text-sm shadow"
                        >
                          Add
                        </button>

                      </div>

                    </div>

                  </Link>
                </motion.div>
              );
            })}


          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-10 gap-3 flex-wrap">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-4 py-2 rounded-lg text-sm transition ${page === i + 1
                    ? "bg-linear-to-r from-[#FF6B00] to-orange-600 text-white shadow"
                    : "bg-white border border-gray-200 hover:border-[#FF6B00]"
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
