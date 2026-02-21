import { useRouter } from "next/router";
import { useEffect, useState, useContext } from "react";
import Link from "next/link";
import { Star, MapPin, ArrowLeft, Calendar, ShoppingCart, } from "lucide-react";
import { motion } from "framer-motion";
import { CartContext } from "@/context/CartContext";
import toast from "react-hot-toast";
import Seo from "@/components/Seo";
import Image from "next/image";
import { getCloudinaryUrl } from "@/lib/cloudinary-url";

export default function RestaurantDetails() {
  const router = useRouter();
  const { addToCart } = useContext(CartContext);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("All");

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [location, setLocation] = useState("INSIDE");
  const restaurantLocation = restaurant?.address || "";
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [specialNote, setSpecialNote] = useState("");
  const formatPrice = (amount: number) => Math.round(amount);
  const [tables, setTables] = useState<any[]>([]);
  const [preOrderProducts, setPreOrderProducts] = useState<
    { productId: number; quantity: number; price: number; name: string }[]
  >([]);

  const toggleProduct = (p: any) => {
    setPreOrderProducts((prev) =>
      prev.find((item) => item.productId === p.id)
        ? prev.filter((item) => item.productId !== p.id)
        : [
          ...prev,
          {
            productId: p.id,
            quantity: 1,
            price: p.finalPrice,
            name: p.name,
          },
        ]
    );
  };

  const updateQuantity = (productId: number, type: "inc" | "dec") => {
    setPreOrderProducts((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
            ...item,
            quantity:
              type === "inc"
                ? item.quantity + 1
                : Math.max(1, item.quantity - 1),
          }
          : item
      )
    );
  };

  const removePreOrderItem = (productId: number) => {
    setPreOrderProducts((prev) =>
      prev.filter((item) => item.productId !== productId)
    );
  };

  const preOrderTotal = preOrderProducts.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const advanceAmount =
    restaurant?.bookingSetting?.advanceValue || 0;

  const totalPayable = preOrderTotal + advanceAmount;


  useEffect(() => {
    if (!showBookingModal) return;

    const fetchTables = async () => {
      const res = await fetch(
        `/api/user/restaurant/${restaurant.id}/tables`
      );
      const data = await res.json();
      setTables(data);
    };

    fetchTables();
  }, [showBookingModal]);

  useEffect(() => {
    if (!router.isReady) return;

    const fetchRestaurant = async () => {
      try {
        const res = await fetch(`/api/user/restaurants/${router.query.id}`);
        const data = await res.json();
        setRestaurant(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [router.isReady]);

  useEffect(() => {
    if (!showBookingModal || !restaurant?.id) return;

    const fetchTables = async () => {
      try {
        const res = await fetch(
          `/api/admin/restaurants/tables?restaurantId=${restaurant.id}`
        );

        const data = await res.json();

        if (res.ok) {
          // Only active tables show to user
          setTables(data.filter((t: any) => t.isActive));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchTables();
  }, [showBookingModal, restaurant?.id]);

  useEffect(() => {
    setSelectedTable(null);
  }, [location]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-black border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!restaurant) {
    return <div className="text-center py-20">Restaurant not found</div>;
  }

  const rule = restaurant.deliveryRules?.[0];
  const bookingEnabled = restaurant.bookingSetting?.isBookingEnabled;

  const filteredProducts =
    filterType === "All"
      ? restaurant.products
      : restaurant.products.filter((p: any) =>
        filterType === "Veg"
          ? p.category?.toLowerCase().includes("veg")
          : p.category?.toLowerCase().includes("non")
      );

  return (
    <>
      {restaurant && (
        <Seo
          title={`${restaurant?.name} in ${restaurantLocation} | Order Online | SnapKart`}
          description={`Order food from ${restaurant?.name} in ${restaurantLocation}. Explore menu, check ratings & book table instantly.`}
          image={getCloudinaryUrl(restaurant?.image, 1200, 630)}
          url={`${process.env.NEXT_PUBLIC_SITE_URL}/user/restaurants/${restaurant?.id}`}
        />
      )}
      <div className="min-h-screen bg-linear-to-b from-orange-50 to-white">

        {/* ===== Small Header Section ===== */}
        <div className="mb-10">
          <div className="bg-linear-to-r from-orange-500 to-orange-600 h-60 flex flex-col justify-end  py-8 px-6 text-center shadow-lg relative overflow-hidden">

            {/* Soft background glow */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white,transparent_70%)]"></div>

            <h1 className="text-2xl md:text-3xl font-bold text-white relative z-10">
              {restaurant.name}
            </h1>

            <p className="text-orange-100 mt-2 text-sm md:text-base relative z-10">
              View restaurant details, & book you table and special dishes.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white/90 backdrop-blur border-b sticky top-0 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#FF6B00] transition"
              >
                <ArrowLeft size={18} />
                Back
              </button>
              <h1 className="text-lg md:text-xl font-semibold text-gray-800 truncate">
                {restaurant.name}
              </h1>
            </div>
          </div>
          {/* Banner */}
          <div className="relative rounded-3xl overflow-hidden mb-8 md:mb-10 shadow-lg mt-10">
            <div className="relative w-full h-56 md:h-72">
              <Image
                src={getCloudinaryUrl(restaurant.image, 1400, 800)}
                alt={restaurant.name}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-transparent flex items-end p-6 md:p-8">
              <div className="text-white">
                <h2 className="text-2xl md:text-4xl font-bold">
                  {restaurant.name}
                </h2>
                <p className="flex items-center mt-2 text-sm md:text-base opacity-90">
                  <MapPin size={16} className="mr-2" />
                  {restaurant.address}
                </p>
              </div>
            </div>
          </div>

          {/* Info Row */}
          <div className="flex flex-wrap items-center gap-6 md:gap-8 mb-8 md:mb-10 text-sm md:text-base">

            <div className="flex items-center gap-2">
              <Star size={18} fill="#FACC15" className="text-yellow-500" />
              <span className="font-medium text-gray-700">4.5 Rating</span>
            </div>

            <div className="font-semibold text-[#FF6B00]">
              {rule
                ? rule.chargeType === "FREE"
                  ? rule.maxOrder
                    ? `Free Delivery upto ₹${rule.maxOrder}`
                    : "Free Delivery"
                  : `Delivery ₹${rule.chargeAmount}`
                : "Free Delivery"}
            </div>

            <div>
              {restaurant.isOpen ? (
                <span className="text-green-600 font-medium">
                  Open Now
                </span>
              ) : (
                <span className="text-red-500 font-medium">
                  Closed
                </span>
              )}
            </div>
          </div>

          {/* Book Table */}
          {bookingEnabled && (
            <button
              onClick={() => setShowBookingModal(true)}
              className="bg-linear-to-r from-[#FF6B00] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition mb-8 text-sm md:text-base"
            >
              Book a Table
            </button>
          )}

          {/* Menu Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800">
              Menu
            </h3>

            {/* Veg/NonVeg Filter */}
            <div className="flex gap-3 flex-wrap">
              {["All", "Veg", "Non Veg"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-1.5 rounded-full border text-sm transition ${filterType === type
                    ? "bg-[#FF6B00] text-white border-[#FF6B00] shadow"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#FF6B00]"
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts?.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 md:p-16 text-center shadow-sm border border-gray-100">
              <h4 className="text-lg md:text-xl font-semibold mb-2">
                No Products Available
              </h4>
              <p className="text-gray-500 text-sm md:text-base">
                This restaurant has not added any menu items yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">

              {filteredProducts.map((p: any) => {
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
                    className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100"
                  >
                    <Link href={`/user/products/${p.id}`}>
                      <div className="relative overflow-hidden">

                        {/* Product Image */}
                        <div className="relative w-full h-44 overflow-hidden">
                          <Image
                            src={getCloudinaryUrl(p.image, 600, 400)}
                            alt={p.name}
                            fill
                            sizes="(max-width:768px) 50vw, 25vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent"></div>

                        {/* Offer Badge */}
                        {p.offerType && p.offerValue > 0 && (
                          <div className="absolute top-2 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-[#FF6B00] shadow-md">
                            {p.offerType.toLowerCase() === "percentage"
                              ? `${p.offerValue}% OFF`
                              : `₹${p.offerValue} OFF`}
                          </div>
                        )}

                        {/* Extra Offer */}
                        {p.extraType && p.extraValue > 0 && (
                          <div className="absolute top-3 right-3 bg-[#FF6B00] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                            {p.extraType.toLowerCase() === "percentage"
                              ? `Extra ${p.extraValue}%`
                              : `Extra ₹${p.extraValue}`}
                          </div>
                        )}

                        {/* Rating Badge */}
                        <div className="absolute bottom-0 right-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                          <Star size={14} fill="#FACC15" className="text-yellow-500" />
                          <span className="text-xs font-semibold text-gray-700">
                            {p.rating?.toFixed(1) || "0.0"}
                          </span>
                        </div>
                      </div>
                    </Link>

                    <div className="p-3">

                      {/* Product Name */}
                      <h4 className="font-semibold text-lg text-gray-800 truncate">
                        {p.name}
                      </h4>


                      {/* Variant Info */}
                      {hasVariants && (
                        <p className="text-xs text-gray-500 mt-1">
                          {p.variants.length} Sizes Available
                        </p>
                      )}


                      {/* Price Section */}
                      <div className="flex items-center justify-between mt-4">

                        <div>
                          {hasDiscount && (
                            <span className="text-gray-400 line-through text-sm mr-2">
                              ₹{formatPrice(startingPrice)}
                            </span>
                          )}

                          <span className="text-2xl font-bold text-[#FF6B00]">
                            ₹{formatPrice(startingFinalPrice)}
                          </span>

                          {hasVariants && (
                            <span className="text-xs text-gray-500 ml-2">
                              Starts from
                            </span>
                          )}
                        </div>

                        {/* Add Button */}
                        <button
                          onClick={(e) => {
                            if (!restaurant.isOpen) {
                              toast.error("Restaurant is closed");
                              return;
                            }

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
                          className="bg-[#FF6B00] hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition"
                        >
                          Add to cart
                        </button>

                      </div>

                    </div>
                  </motion.div>

                );
              })}

            </div>
          )}

        </div>


        {showBookingModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

            <div className="bg-white rounded-2xl w-full max-w-2xl p-6 relative overflow-y-auto max-h-[90vh]">

              <button
                onClick={() => setShowBookingModal(false)}
                className="absolute top-3 right-4 text-gray-500"
              >
                ✕
              </button>

              <h2 className="text-xl font-semibold mb-6">
                Book Table at {restaurant.name}
              </h2>

              <div className="grid md:grid-cols-2 gap-4">

                {/* Date */}
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="text-sm font-medium">Time</label>
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                {/* Guests */}
                <div>
                  <label className="text-sm font-medium">Guests</label>
                  <input
                    type="number"
                    min="1"
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="text-sm font-medium">Seating</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="INSIDE">Inside</option>
                    <option value="OUTSIDE">Outside</option>
                  </select>
                </div>

              </div>

              {/* Table Selection */}
              <div className="mt-6">
                <label className="text-sm font-medium">Select Table</label>

                {tables.filter((t) => t.location === location).length === 0 ? (
                  <p className="text-sm text-gray-500 mt-2">
                    No tables available for this seating
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {tables
                      .filter((t) => t.location === location)
                      .map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTable(t.id)}
                          className={`border rounded-lg py-2 text-sm transition ${selectedTable === t.id
                            ? "bg-[#FF6B00] text-white"
                            : "hover:bg-gray-100"
                            }`}
                        >
                          Table {t.tableNumber}
                          <div className="text-xs text-gray-500">
                            {t.capacity} seats
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>
              {/* Special Note */}
              <div className="mt-6">
                <label className="text-sm font-medium">
                  Special Instructions
                </label>
                <textarea
                  value={specialNote}
                  onChange={(e) => setSpecialNote(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                />
              </div>

              {/* Pre Order Products */}
              <div className="mt-6">
                <label className="text-sm font-medium">
                  Pre-order Dishes (Optional)
                </label>

                <div className="space-y-3 mt-3">
                  {restaurant.products.map((p: any) => {
                    const selected = preOrderProducts.find(
                      (item) => item.productId === p.id
                    );

                    return (
                      <div
                        key={p.id}
                        className="border rounded-xl p-3 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {p.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            ₹{p.finalPrice}
                          </p>
                        </div>

                        {!selected ? (
                          <button
                            onClick={() => toggleProduct(p)}
                            className="bg-[#FF6B00] text-white px-3 py-1 rounded-lg text-xs"
                          >
                            Add
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">

                            <button
                              onClick={() => updateQuantity(p.id, "dec")}
                              className="px-2 py-1 border rounded"
                            >
                              -
                            </button>

                            <span className="text-sm font-medium">
                              {selected.quantity}
                            </span>

                            <button
                              onClick={() => updateQuantity(p.id, "inc")}
                              className="px-2 py-1 border rounded"
                            >
                              +
                            </button>

                            <span className="text-xs font-medium ml-2">
                              ₹{selected.quantity * p.finalPrice}
                            </span>

                            {/* Remove Button */}
                            <button
                              onClick={() => removePreOrderItem(p.id)}
                              className="text-red-500 text-xs ml-2 hover:underline"
                            >
                              Remove
                            </button>

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary */}
              <div className="mt-6 bg-orange-50 p-4 rounded-xl space-y-2 text-sm">

                <div className="flex justify-between">
                  <span>Pre-order Total</span>
                  <span>₹{formatPrice(preOrderTotal)}</span>
                </div>

                {advanceAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Advance Booking Amount</span>
                    <span>₹{advanceAmount}</span>
                  </div>
                )}

                <div className="flex justify-between font-semibold text-[#FF6B00]">
                  <span>Total Payable</span>
                  <span>₹{formatPrice(totalPayable)}</span>
                </div>

              </div>

              {/* Confirm Button */}
              <button
                onClick={async () => {
                  if (!bookingDate || !bookingTime) {
                    toast.error("Please select date & time");
                    return;
                  }

                  if (!selectedTable) {
                    toast.error("Please select a table");
                    return;
                  }
                  try {
                    const res = await fetch("/api/user/table-booking", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        restaurantId: restaurant.id,
                        tableId: selectedTable,
                        bookingDate,
                        bookingTime,
                        guests,
                        location,
                        specialNote,
                        preOrderedProducts: preOrderProducts.map((item) => ({
                          productId: item.productId,
                          quantity: item.quantity,
                        })),
                      }),
                    });

                    if (res.ok) {
                      toast.success("Booking request sent");
                      setShowBookingModal(false);
                    } else {
                      toast.error("Booking failed");
                    }
                  } catch {
                    toast.error("Server error");
                  }
                }}
                className="w-full mt-6 bg-[#FF6B00] text-white py-3 rounded-lg"
              >
                Confirm Booking
              </button>

            </div>
          </div>
        )}
      </div>
    </>
  );
}
