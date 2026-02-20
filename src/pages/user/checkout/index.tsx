import { useContext, useState, useEffect } from "react";
import { CartContext } from "@/context/CartContext";
import { Link, LocateFixed, MapPin, Minus, Plus, ShoppingBag, ShoppingCart, TicketPercent, TicketPercentIcon, Trash2, User } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { load } from "@cashfreepayments/cashfree-js"
import Seo from "@/components/Seo";


export default function CheckoutPage() {

  const {
    cartItems,
    increaseQty,
    decreaseQty,
    removeFromCart,
    clearCart,
  } = useContext(CartContext);

  const router = useRouter();
  const [userLocation, setUserLocation] = useState<any>(null);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const formatPrice = (amount: number) => {
    return Math.round(Number(amount || 0));
  };



  const subtotal = cartItems.reduce((sum, item) => {

    const basePrice =
      item.variantPrice ||
      item.finalPrice ||
      item.price;

    const extrasTotal = Array.isArray(item.extras)
      ? item.extras.reduce(
        (extraSum: number, ex: any) =>
          extraSum + Number(ex?.price || 0),
        0
      )
      : 0;

    const singleItemTotal = basePrice + extrasTotal;

    return sum + (singleItemTotal * item.quantity);

  }, 0);


  const restaurantId = cartItems[0]?.restaurantId;

  interface Address {
    id: number;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
    isDefault: boolean;
  }


  /* ---------------- FETCH COUPONS ---------------- */
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await fetch("/api/user/coupons");
        const data = await res.json();
        setAvailableCoupons(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCoupons();
  }, []);

  /* ---------------- DETECT LOCATION ---------------- */

  const detectLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        toast.success("Location detected");
      },
      () => toast.error("Location permission denied")
    );
  };
  /* ---------------- DELIVERY CALCULATION ---------------- */

  useEffect(() => {
    const calculateDelivery = async () => {
      if (!userLocation || !restaurantId) return;

      const res = await fetch("/api/user/delivery-charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          userLat: userLocation.lat,
          userLng: userLocation.lng,
          cartTotal: subtotal,
        }),
      });

      const data = await res.json();

      console.log("Delivery API Response:", data); // 🔥 DEBUG

      setDistance(data.distance || 0);
      setDeliveryCharge(Number(data.deliveryCharge || 0));
    };

    calculateDelivery();
  }, [userLocation, subtotal, restaurantId]);



  /* ---------------- APPLY COUPON ---------------- */

  const applyCouponWithCode = async (code: string) => {
    try {
      const res = await fetch("/api/user/apply-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          cartTotal: subtotal,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      setDiscount(data.discount);
      setAppliedCoupon({
        code,
        discount: data.discount,
      });

      setCouponMessage(
        "🎉 Congratulations! Coupon applied successfully"
      );

      toast.success("Coupon Applied 🎉");
    } catch (error) {
      console.error(error);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode) {
      toast.error("Enter coupon code");
      return;
    }

    applyCouponWithCode(couponCode);
    setCouponCode("");
  };

  const applySelectedCoupon = (code: string) => {
    setCouponCode(code);
    applyCouponWithCode(code);
  };

  const removeCoupon = () => {
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponMessage("");
    toast.success("Coupon removed");
  };

  const finalAmount = formatPrice(
    Number(subtotal) + Number(deliveryCharge) - Number(discount)
  );

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/user/address/list");
      const data = await res.json();

      if (res.ok) {
        const addressList = data.addresses || [];
        setAddresses(addressList);

        if (addressList.length > 0) {
          const defaultAddress = addressList.find(
            (a: any) => a.isDefault
          );

          const selectedId =
            defaultAddress?.id || addressList[0].id;

          setSelectedAddressId(selectedId);

        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const placeOrder = async () => {

    if (!userLocation?.lat || !userLocation?.lng) {
      toast.error("Please detect your location first");
      return;
    }

    if (!selectedAddressId) {
      toast.error("Please select delivery address");
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    try {
      setLoading(true);

      // ✅ 1️⃣ CREATE ORDER FIRST
      const res = await fetch("/api/user/orders/create", {

        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          addressId: selectedAddressId,
          paymentMethod,
          cartItems: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            variantId: item.variantId || null,
            extras: item.extras || [],
          })),

          couponCode: appliedCoupon?.code || null,

          // 🔥 IMPORTANT: Send GPS Location
          userLat: userLocation?.lat,
          userLng: userLocation?.lng,
        }),
      });


      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Order failed");
        setLoading(false);
        return;
      }

      const orderId = data.order.id; // ⚠️ Make sure backend returns order

      // ===============================
      // ✅ COD FLOW
      // ===============================
      if (paymentMethod === "COD") {

        toast.success("Order placed successfully 🎉");

        clearCart(); // ✅ clear immediately

        setTimeout(() => {
          router.push("/user/orders");
        }, 1000);

        return;
      }

      // ===============================
      // ✅ ONLINE PAYMENT FLOW
      // ===============================

      // 2️⃣ Create payment session
      const paymentRes = await fetch("/api/payment/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceType: "ORDER",
          referenceId: orderId,
        }),
      });

      const paymentData = await paymentRes.json();

      if (!paymentRes.ok) {
        const err = await paymentRes.json();
        toast.error(err.message || "Payment init failed");
        return;
      }

      // 3️⃣ Load Cashfree SDK
      const cashfree = await load({
        mode: process.env.NEXT_PUBLIC_CASHFREE_MODE === "PROD"
          ? "production"
          : "sandbox",
      });

      // 4️⃣ Open Checkout Popup
      await cashfree.checkout({
        paymentSessionId: paymentData.paymentSessionId,
        redirectTarget: "_modal",
      });

      // 5️⃣ VERIFY PAYMENT AFTER POPUP CLOSE
      const verifyRes = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: paymentData.paymentId,
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyData.success) {

        toast.success("Payment Successful 🎉");

        clearCart(); // ✅ clear only after success

        setTimeout(() => {
          router.push("/user/orders");
        }, 1000);

      } else {
        toast.error("Payment Failed");
      }

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddress = addresses.find((a: any) => a.isDefault);
      setSelectedAddressId(defaultAddress?.id || addresses[0].id);
    }
  }, [addresses]);


  if (!cartItems.length) {
    return (
      <>
        <div className="mb-10">
          <div className="bg-linear-to-r from-orange-500 to-orange-600 h-60 flex flex-col justify-end py-8 px-6 text-center shadow-lg relative overflow-hidden">

            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white,transparent_70%)]"></div>

            <h1 className="text-2xl md:text-3xl font-bold text-white relative z-10 flex items-center justify-center gap-2">
              <ShoppingCart size={28} />
              Cart Empty
            </h1>

            <p className="text-orange-100 mt-2 text-sm md:text-base relative z-10">
              Please add items to show here
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
          <ShoppingBag size={40} className="mb-3 opacity-40" />
          Your cart is empty
        </div>
      </>
    );
  }

  return (
    <>
      <Seo
        title={`Checkout (${cartItems.length} items) | SnapKart`}
        description="Complete your order securely on SnapKart."
        url="https://yourdomain.com/user/checkout"
      />

      {/* 🔒 Prevent Indexing */}
      <meta name="robots" content="noindex,nofollow" />

      {/* ===== Small Header Section ===== */}
      <div className="mb-10">
        <div className="bg-linear-to-r from-orange-500 to-orange-600 h-60 flex flex-col justify-end  py-8 px-6 text-center shadow-lg relative overflow-hidden">

          {/* Soft background glow */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white,transparent_70%)]"></div>

          <h1 className="text-2xl md:text-3xl font-bold text-white relative z-10 flex gap-5 justify-center align-middle">
            <ShoppingCart className="text-white" size={28} />
            Checkout
          </h1>

          <p className="text-orange-100 mt-2 text-sm md:text-base relative z-10">
            Complete your order securely on SnapKart.
          </p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 py-5 px-3">

        {/* LEFT SECTION */}
        <div className="md:col-span-2 space-y-8 bg-white p-3 rounded-2xl shadow-md">

          {/* ADDRESS SECTION */}
          <div>
            <h2 className="font-semibold mb-4 text-lg flex items-center gap-2">
              <MapPin size={18} className="text-[#FF6B00]" />
              Select Delivery Address
            </h2>

            {addresses.length === 0 && (
              <>
                <p className="text-gray-500 text-center">To place an order, please visit your Profile section and add a valid delivery address.
                  <a href="/user/profile" className="m-auto p-2 rounded-full text-[#FF6B00] hover:bg-white hover:text-[#FF6B00] flex justify-center">
                    <User size={22} />
                  </a>
                </p>

              </>
            )}

            {addresses.map((address) => (
              <div
                key={address.id}
                onClick={() => setSelectedAddressId(address.id)}
                className={`p-4 border rounded-xl cursor-pointer mb-3 transition-all duration-200 ${selectedAddressId === address.id
                  ? "border-[#FF6B00] bg-orange-50 shadow-md"
                  : "border-gray-200 hover:border-[#FF6B00] hover:shadow"
                  }`}
              >
                <p className="font-semibold text-gray-800">
                  {address.fullName}
                </p>
                <p className="text-sm text-gray-600">
                  {address.address}, {address.city}
                </p>
                <p className="text-sm text-gray-600">
                  {address.state} - {address.pincode}
                </p>
              </div>
            ))}
          </div>

          {/* CART ITEMS */}
          <div className="space-y-4">
            {cartItems.map((item) => {

              const basePrice =
                item.variantPrice ||
                item.finalPrice ||
                item.price;

              const extrasTotal =
                item.extras?.reduce(
                  (sum: number, ex: any) =>
                    sum + Number(ex.price || 0),
                  0
                ) || 0;

              const singleItemTotal = basePrice + extrasTotal;
              const itemTotal = singleItemTotal * item.quantity;

              return (
                <div
                  key={item.cartKey || item.id}
                  className="bg-gray-100 p-3 rounded-2xl shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start gap-4">

                    {/* LEFT SIDE */}
                    <div className="flex gap-2">

                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-200 shrink-0">
                        <img
                          src={item.image || "/placeholder.jpg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="space-y-1">

                        {/* Product Name */}
                        <h3 className="font-semibold text-gray-800">
                          {item.name}
                        </h3>

                        {/* Variant */}
                        {item.variantName && (
                          <p className="text-sm text-gray-600">
                            Variant:{" "}
                            <span className="font-medium">
                              {item.variantName}
                            </span>

                            {item.variantPrice && (
                              <span className="text-orange-600 font-medium">
                                {" "} (+₹{formatPrice(item.variantPrice)})
                              </span>
                            )}
                          </p>
                        )}

                        {/* Extras */}
                        {Array.isArray(item.extras) && item.extras.length > 0 && (
                          <div className="text-sm text-gray-600">
                            Extras:
                            {item.extras.map((ex: any, index: number) => (
                              <div key={index}>
                                • {ex.name}
                                <span className="text-orange-600">
                                  {" "} (+₹{Math.round(ex.price)})
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Quantity */}
                        <p className="text-xs text-gray-500 mt-1">
                          Qty: {item.quantity}
                        </p>

                      

                      </div>
                    </div>


                    {/* RIGHT SIDE PRICE */}
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        ₹ {singleItemTotal} × {item.quantity}
                      </p>
                      <p className="font-semibold text-[#FF6B00] text-lg">
                        ₹ {itemTotal}
                      </p>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>



        </div>

        {/* RIGHT SECTION */}
        <div className="space-y-6">

          {/* DETECT LOCATION */}
          <button
            onClick={detectLocation}
            className="bg-linear-to-r from-[#FF6B00] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white w-full py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <LocateFixed size={18} />
            Detect My Location
          </button>

          {/* ORDER SUMMARY */}
          <div className="bg-white p-6 rounded-2xl shadow-md space-y-3">
            <h3 className="font-semibold text-gray-800 mb-2">
              Order Summary
            </h3>

            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>₹ {formatPrice(subtotal)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Distance</span>
              <span>{distance.toFixed(2)} km</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Delivery</span>
              <span>
                {deliveryCharge <= 0
                  ? "FREE"
                  : `₹ ${formatPrice(deliveryCharge)}`}
              </span>
            </div>

            <div className="flex justify-between text-green-600 text-sm">
              <span>Discount</span>
              <span>- ₹ {formatPrice(discount)}</span>
            </div>

            <div className="flex justify-between font-bold border-t pt-3 text-lg text-[#FF6B00]">
              <span>Total</span>
              <span>₹ {formatPrice(finalAmount)}</span>
            </div>
          </div>

          {/* COUPON BOX */}
          <div className="bg-white p-6 rounded-2xl shadow-md space-y-3">
            {!appliedCoupon ? (
              <>
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter Coupon Code"
                  className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-[#FF6B00] outline-none"
                />

                <button
                  onClick={applyCoupon}
                  className="bg-linear-to-r from-[#FF6B00] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white w-full py-2 rounded-lg transition cursor-pointer"
                >
                  Apply Coupon
                </button>
              </>
            ) : (
              <div className="bg-green-50 border border-green-200 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-green-700">
                    {appliedCoupon.code} Applied
                  </span>

                  <button
                    onClick={removeCoupon}
                    className="text-red-500 text-sm cursor-pointer"
                  >
                    Remove
                  </button>
                </div>

                <p className="text-sm text-green-600">
                  {couponMessage}
                </p>

                <p className="text-sm">
                  You saved ₹ {formatPrice(appliedCoupon.discount)}
                </p>
              </div>
            )}
          </div>

          {/* AVAILABLE COUPONS */}
          {!appliedCoupon && availableCoupons.length > 0 && (
            <div className="bg-white p-5 rounded-2xl shadow-md border border-orange-100 space-y-4">

              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <TicketPercentIcon size={18} className="text-[#FF6B00]" />
                Available Coupons
              </h3>

              {availableCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="border border-gray-200 hover:border-[#FF6B00] rounded-xl p-4 flex justify-between items-center transition-all duration-200 hover:shadow-sm bg-orange-50/40"
                >
                  {/* LEFT SIDE */}
                  <div className="space-y-1">
                    <p className="font-semibold text-[#FF6B00] text-sm md:text-base">
                      {coupon.code}
                    </p>

                    <p className="text-xs md:text-sm text-gray-600">
                      {coupon.description || "Special discount available"}
                    </p>
                  </div>

                  {/* APPLY BUTTON */}
                  <button
                    onClick={() =>
                      applySelectedCoupon(coupon.code)
                    }
                    className="bg-linear-to-r from-[#FF6B00] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg text-xs md:text-sm shadow-sm hover:shadow-md transition cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              ))}

            </div>
          )}


          {/* PAYMENT METHOD */}
          <div className="bg-white p-6 rounded-2xl shadow-md space-y-3">
            <h3 className="font-semibold text-gray-800">
              Payment Method
            </h3>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
              />
              Cash on Delivery
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={paymentMethod === "ONLINE"}
                onChange={() => setPaymentMethod("ONLINE")}
              />
              Online Payment
            </label>
          </div>

          {/* PLACE ORDER BUTTON */}
          <button
            onClick={placeOrder}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl w-full shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>

        </div>
      </div>

    </>
  );
}
