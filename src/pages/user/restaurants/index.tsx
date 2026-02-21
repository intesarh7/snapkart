import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import axios from "axios";
import Seo from "@/components/Seo";
import { useContext } from "react";
import { LocationContext } from "@/context/LocationContext";
import Image from "next/image";
import { getCloudinaryUrl } from "@/lib/cloudinary-url";

export default function AllRestaurants() {
  const router = useRouter();

  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const locationCtx = useContext(LocationContext);
  const locationName = locationCtx?.locationName;

  // ✅ Fetch Restaurants Safely
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);

        const res = await axios.get("/api/user/restaurants");
        setRestaurants(res.data); // ✅ FIXED

      } catch (err) {
        console.error("Restaurant Fetch Error:", err);
        setError("Failed to load restaurants");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // ✅ Safe Filter
  const filteredRestaurants = (restaurants || []).filter((r: any) =>
    (r.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Seo
        title={
          locationName
            ? `Best Restaurants in ${locationName} | SnapKart`
            : "Explore Restaurants Near You | SnapKart"
        }
        description={
          locationName
            ? `Discover top-rated restaurants in ${locationName}. Order food online or book tables instantly with SnapKart.`
            : "Discover top-rated restaurants near you. Order food online or book tables instantly with SnapKart."
        }
        image="https://snapkart.in/og-restaurants.jpg"
        url="https://snapkart.in/user/restaurants"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: restaurants?.map((r: any, index: number) => ({
              "@type": "ListItem",
              position: index + 1,
              name: r.name,
              url: `https://snapkart.in/user/restaurants/${r.id}`,
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
              All Restaurants List
            </h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-6">

          {/* Header */}
          <div className="bg-white/90 backdrop-blur border-b sticky top-0 z-40 mb-8 rounded-xl shadow-sm">
            <div className="px-4 md:px-6 py-4 flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#FF6B00] transition"
              >
                <ArrowLeft size={18} />
                Back
              </button>

            </div>
          </div>

          {/* Search */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search restaurants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-96 border bg-white border-gray-200 px-4 py-2 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 outline-none shadow-sm"
            />
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-16 text-gray-500">
              Loading restaurants...
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-center py-16 text-red-500">
              {error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filteredRestaurants.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-2">
                No Restaurants Found
              </h3>
              <p className="text-gray-500 text-sm">
                Try searching with a different keyword.
              </p>
            </div>
          )}

          {/* Grid */}
          {!loading && !error && filteredRestaurants.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

              {filteredRestaurants.map((r: any) => (
                <motion.div
                  key={r.id}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition border border-gray-100"
                >
                  <Link href={`/user/restaurants/${r.id}`}>

                    <div className="relative">
                      <div className="relative w-full h-44">
                        <Image
                          src={getCloudinaryUrl(r.image, 600, 400)}
                          alt={r.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                          loading="lazy"
                          placeholder="empty"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg";
                          }}
                        />
                      </div>

                      <div className="absolute top-3 right-3">
                        {r.isOpen ? (
                          <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full shadow">
                            Open
                          </span>
                        ) : (
                          <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full shadow">
                            Closed
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4">

                      <h3 className="font-semibold text-lg text-gray-800 hover:text-[#FF6B00] transition truncate">
                        {r.name}
                      </h3>

                      <p className="flex items-center text-xs text-gray-500 mt-1">
                        <MapPin size={14} className="mr-1" />
                        {r.address}
                      </p>

                      <div className="flex justify-between items-center mt-3 text-sm">

                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star size={14} fill="#FACC15" />
                          <span className="text-gray-700">
                            {r.rating?.toFixed(1) || "0.0"}
                          </span>
                        </div>

                        <span className="text-[#FF6B00] font-medium text-xs">
                          {r.deliveryTime || "30-40 min"}
                        </span>

                      </div>

                    </div>

                  </Link>
                </motion.div>
              ))}

            </div>
          )}

        </div>
      </div>
    </>
  );
}
