import { useRouter } from "next/router";
import { useEffect, useState, useContext } from "react";
import { CartContext } from "@/context/CartContext";
import { Star, ShoppingCart, MapPin, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";
import Seo from "@/components/Seo";
import { LocationContext } from "@/context/LocationContext";
import Image from "next/image";
import { getCloudinaryUrl } from "@/lib/cloudinary-url";

export default function ProductDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const locationCtx = useContext(LocationContext);
  const locationName = locationCtx?.locationName;
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<number[]>([]);

  

  const formatPrice = (amount: number) => {
    return Math.round(Number(amount || 0));
  };

useEffect(() => {
  if (typeof id !== "string") return;

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/user/products/${id}`);
      const data = await res.json();
      setProduct(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchProduct();
}, [id]);

  console.log("DETAIL PRODUCT:", product);

  if (loading || typeof id !== "string") {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-black border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        Product not found
      </div>
    );
  }
  const productLocation =
    locationName ||
    product.restaurant?.address ||
    "";

  const dynamicTitle = `${product.name} - ₹${product.finalPrice} at ${product.restaurant?.name}${productLocation ? ` in ${productLocation}` : ""
    } | SnapKart`;



  const hasVariants = product.variants && product.variants.length > 0;

  const startingPrice = hasVariants
    ? Math.min(...product.variants.map((v: any) => v.price))
    : product.price;

  const startingFinalPrice = hasVariants
    ? Math.min(
      ...product.variants.map((v: any) => v.finalPrice || v.price)
    )
    : product.finalPrice;

  const hasDiscount = startingFinalPrice < startingPrice;

  const discountPercent = hasDiscount
    ? Math.round(
      ((startingPrice - startingFinalPrice) / startingPrice) * 100
    )
    : 0;

  // 🔥 Enhanced SEO Title with Discount Support
  const seoTitle =
    hasDiscount
      ? `${product.name} ${discountPercent}% OFF - ₹${product.finalPrice} (₹${product.price}) at ${product.restaurant?.name
      }${productLocation ? ` in ${productLocation}` : ""} | SnapKart`
      : dynamicTitle;

  return (
    <>
      <Seo
        title={seoTitle}
        description={`${product.name} available at ${product.restaurant?.name}. ${hasDiscount
          ? `Get ${discountPercent}% OFF now!`
          : ""
          } Order online with fast delivery on SnapKart.`}
        image={getCloudinaryUrl(product.image, 1200, 630)}
        url={`https://snapkart.in/user/products/${product.id}`}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            image: getCloudinaryUrl(product.image, 1200, 1200),
            description: product.description,
            brand: {
              "@type": "Brand",
              name: product.restaurant?.name,
            },
            offers: {
              "@type": "Offer",
              priceCurrency: "INR",
              price: product.finalPrice,
              availability: "https://schema.org/InStock",
            },
          }),
        }}
      />


      <div className="bg-linear-to-b from-orange-50 to-white min-h-screen">
        {/* ===== Small Header Section ===== */}
        <div className="mb-10">
          <div className="bg-linear-to-r from-orange-500 to-orange-600 h-60 flex flex-col justify-end  py-8 px-6 text-center shadow-lg relative overflow-hidden">

            {/* Soft background glow */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white,transparent_70%)]"></div>

            <h1 className="text-2xl md:text-3xl font-bold text-white relative z-10">
              Items details
            </h1>

            <p className="text-orange-100 mt-2 text-sm md:text-base relative z-10">
              Check view and your deshes.
            </p>
          </div>
        </div>
        <div className="mr-3 ml-3 mb-5">
        {/* Top Bar */}
        <div className="bg-white/90 border-b mb-6 shadow-sm rounded-xl max-w-7xl mx-auto px-3 ">
          <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 flex items-center gap-4">

            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#FF6B00] transition"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            <div className="text-sm text-gray-500  md:block truncate">
              <Link
                href="/user/products"
                className="mx-1 hover:text-[#FF6B00] transition"
              >
                All Items
              </Link>
              /
              <span className="text-gray-800 ml-1">
                {product.name}
              </span>
            </div>

          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5 md:gap-5 items-start max-w-7xl mx-auto">

          {/* Left Image */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative rounded-3xl overflow-hidden shadow-xl"
          >

            <div className="relative w-full h-72 md:h-125">
              <Image
                src={getCloudinaryUrl(product.image, 1000, 1000)}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>

            {/* Bestseller Badge */}
            {product.isBestseller && (
              <div className="absolute top-4 left-4">
                <span className="bg-linear-to-r from-orange-500 to-orange-600 text-white text-xs md:text-sm font-semibold px-3 py-1.5 rounded-full shadow-md">
                  🔥 Bestseller
                </span>
              </div>
            )}

          </motion.div>

          {/* Right Content */}
          <div className="bg-white/90 p-5 shadow-sm rounded-xl">

            {/* Restaurant */}
            <Link
              href={`/user/restaurants/${product.restaurantId}`}
              className="text-sm text-gray-500 hover:text-[#FF6B00] transition"
            >
              {product.restaurant?.name}
            </Link>

            {/* Name */}
            {/* Veg / Non Veg Badge */}
            <div className="mt-3 flex items-center gap-3">

              {product.type === "VEG" ? (
                <span className="flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
                  <span className="w-2 h-2 rounded-full bg-green-600"></span>
                  Veg
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-medium bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  Non Veg
                </span>
              )}

            </div>

            {/* Name */}
            <h1 className="text-2xl md:text-4xl font-bold mt-2 text-gray-800 leading-tight">
              {product.name}
            </h1>

            <p className="text-sm md:text-base font-medium mt-2 text-gray-600">
              {product.description}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-4">
              <Star size={18} fill="#FACC15" className="text-yellow-500" />
              <span className="font-medium text-gray-800">
                {product.rating?.toFixed(1) || "0.0"}
              </span>
              <span className="text-gray-500 text-sm">
                (32 reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mt-6 flex items-center gap-3 flex-wrap">

              {hasDiscount && (
                <span className="text-gray-400 line-through text-base md:text-lg">
                  ₹{formatPrice(startingPrice)}
                </span>
              )}

              <span className="text-2xl md:text-3xl font-bold text-[#FF6B00]">
                ₹{formatPrice(startingFinalPrice)}
              </span>

              {hasVariants && (
                <span className="text-sm text-gray-500">
                  Starts from
                </span>
              )}

              {hasDiscount && (
                <span className="text-green-600 text-sm font-medium bg-green-50 px-3 py-1 rounded-full">
                  {discountPercent}% OFF
                </span>
              )}

            </div>
            {hasVariants && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-3">
                  {product.variants.length} Sizes Available
                </p>

                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant: any) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200
                      ${selectedVariantId === variant.id
                          ? "bg-[#FF6B00] text-white border-[#FF6B00] shadow-md"
                          : "bg-white text-gray-700 border-gray-300 hover:border-[#FF6B00]"
                        }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {Array.isArray(product.extras) && product.extras.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Add Extras
                </h3>

                <div className="flex flex-wrap gap-3">
                  {product.extras.map((extra: any) => {
                    const isSelected = selectedExtras.includes(extra.id);

                    return (
                      <button
                        key={extra.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedExtras(
                              selectedExtras.filter(id => id !== extra.id)
                            );
                          } else {
                            setSelectedExtras([...selectedExtras, extra.id]);
                          }
                        }}
                        className={`gap-5 items-center justify-between border rounded-xl px-4 py-2 transition-all duration-200
                            ${isSelected
                            ? "border-[#FF6B00] bg-orange-50 shadow-sm"
                            : "border-gray-300 hover:border-[#FF6B00]"
                          }`}
                      >
                        <span className="text-sm font-medium">
                          {extra.name}
                        </span>

                        <span className="text-sm font-semibold text-gray-700">
                          +₹{formatPrice(extra.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}


            {/* Description */}
            <p className="mt-6 text-gray-600 leading-relaxed text-sm md:text-base">
              {product.description}
            </p>

            {/* Address */}
            <p className="flex items-center text-gray-500 text-sm mt-6">
              <MapPin size={14} className="mr-1" />
              {product.restaurant?.address}
            </p>

            {/* Add To Cart */}
            <button
              onClick={() => {
                const selectedVariant = hasVariants
                  ? product.variants.find((v: any) => v.id === selectedVariantId)
                  : null;

                const selectedExtrasData = product.extras.filter((e: any) =>
                  selectedExtras.includes(e.id)
                );
                addToCart({
                  id: product.id,
                  name: product.name,
                  image: product.image,
                  restaurantId: product.restaurantId,

                  variantId: selectedVariant?.id || null,
                  variantName: selectedVariant?.name || null,
                  variantPrice: selectedVariant?.price || startingFinalPrice,

                  extras: selectedExtrasData,   // 👈 IMPORTANT

                  price: selectedVariant?.price || startingPrice,
                  finalPrice:
                    (selectedVariant?.finalPrice || selectedVariant?.price || startingFinalPrice) +
                    selectedExtrasData.reduce((sum: number, e: any) => sum + e.price, 0),
                });
                toast.success("Added to cart 🛒");
              }}
              className="mt-8 w-full md:w-auto flex items-center justify-center gap-2 bg-linear-to-r from-[#FF6B00] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 md:py-4 rounded-2xl transition text-base md:text-lg shadow-md hover:shadow-lg"
            >
              <ShoppingCart size={20} />
              Add To Cart
            </button>

          </div>
        </div>
        </div>
      </div>
    </>
  );
}
