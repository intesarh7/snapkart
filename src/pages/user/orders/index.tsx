import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { load } from "@cashfreepayments/cashfree-js"; // 🔥 ADD NEW
import { useRouter } from "next/router"
import Seo from "@/components/Seo";
import { PackageSearch, ShoppingBag, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { getCloudinaryUrl } from "@/lib/cloudinary-url";


interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    name: string;
  };
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  refundAmount?: number;
  paymentStatus: string;
  refundStatus?: string;
  finalAmount: number;
  totalAmount: number;
  deliveryCharge: number;
  discount?: number;
  createdAt: string;
  restaurant?: {
    name: string;
  };
  address?: {
    address: string;
    city: string;
  };
  items: {
    id: number;
    quantity: number;
    price: number;
    product?: {
      name: string;
      image?: string;
    };
  }[];
}

export default function MyOrders() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const formatPrice = (amount: number) => {
    return Math.round(Number(amount || 0));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/user/orders/list");
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Fetch Orders Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 ADD NEW — RETRY PAYMENT FUNCTION
  const retryPayment = async (orderId: number) => {
    try {
      const res = await fetch("/api/payment/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          referenceType: "ORDER",
          referenceId: orderId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      const cashfree = await load({
        mode:
          process.env.NEXT_PUBLIC_CASHFREE_MODE === "PRODUCTION"
            ? "production"
            : "sandbox",
      });

      await cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        redirectTarget: "_modal",
      });

      await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: data.paymentId,
        }),
      });

      toast.success("Payment Successful 🎉");
      fetchOrders();
    } catch (error) {
      toast.error("Retry failed");
    }

  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-700";
      case "PREPARING":
        return "bg-orange-100 text-orange-700";
      case "OUT_FOR_DELIVERY":
        return "bg-purple-100 text-purple-700";
      case "DELIVERED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentBadge = (method: string) => {
    if (method === "ONLINE") {
      return "bg-green-100 text-green-700";
    }
    return "bg-gray-100 text-gray-700";
  };

  const cancelOrder = async (orderId: number) => {
    try {
      setProcessingId(orderId);

      const res = await fetch("/api/user/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          reason: "User cancelled order",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        fetchOrders();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <>
        <div className="mb-10">
          <div className="bg-linear-to-r from-orange-500 to-orange-600 h-60 flex flex-col justify-end  py-8 px-6 text-center shadow-lg relative overflow-hidden">

            {/* Soft background glow */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white,transparent_70%)]"></div>

            <h1 className="text-2xl md:text-3xl font-bold text-white relative z-10">
              <ShoppingCart className="text-[#FF6B00]" size={28} />
              No orders found.
            </h1>

            <p className="text-orange-100 mt-2 text-sm md:text-base relative z-10">
              Once you place an order, you’ll be able to track it here.
            </p>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white relative z-10">
          <ShoppingBag size={40} className="mb-3 opacity-40" />
          Loading Orders...
        </h1>
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Seo
        title={`My ${orders.length} Orders | SnapKart`}
        description="View your recent food orders, track delivery status and manage payments on SnapKart."
        url={`${process.env.NEXT_PUBLIC_SITE_URL}/user/orders`}
      />

      {/* 🔒 Prevent Google Indexing */}
      <meta name="robots" content="noindex,nofollow" />
      <div className="min-h-screen bg-linear-to-b from-orange-50 to-white">
        {/* ===== Small Header Section ===== */}
        <div className="mb-10">
          <div className="bg-linear-to-r from-orange-500 to-orange-600 h-60 flex flex-col justify-end  py-8 px-6 text-center shadow-lg relative overflow-hidden">

            {/* Soft background glow */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white,transparent_70%)]"></div>

            <h1 className="text-2xl md:text-3xl font-bold text-white relative z-10">
              My Orders
            </h1>

            <p className="text-orange-100 mt-2 text-sm md:text-base relative z-10">
              Track and manage your recent purchases
            </p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto space-y-6 p-3">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-orange-100">

              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-orange-50">
                  <PackageSearch className="w-8 h-8 text-[#FF6B00]" />
                </div>
              </div>

              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                No Orders Yet
              </h3>

              <p className="text-gray-500 text-sm sm:text-base mt-2 max-w-md mx-auto leading-relaxed">
                Looks like you haven't placed any orders yet. Start exploring restaurants
                and enjoy delicious meals delivered to your doorstep.
              </p>

              <button
                onClick={() => router.push("/")}
                className="mt-6 inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#FF6B00] text-white font-medium hover:bg-[#e65c00] transition-all duration-300 active:scale-95"
              >
                Browse Restaurants
              </button>

            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 space-y-3"
              >
                {/* TOP ROW */}
                <div className="flex justify-between items-start">

                  <div>
                    <p className="font-semibold text-sm">
                      Order #{order.orderNumber}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>

                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span
                        className={`px-2 py-0.5 text-[10px] rounded-full ${getPaymentBadge(
                          order.paymentMethod
                        )}`}
                      >
                        {order.paymentMethod}
                      </span>

                      {order.paymentStatus === "PAID" && (
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-green-100 text-green-700">
                          PAID
                        </span>
                      )}

                      {order.refundStatus === "REFUNDED" && (
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-yellow-100 text-yellow-700">
                          REFUNDED ₹{formatPrice(order.refundAmount || 0)}
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 text-[10px] font-medium rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.replaceAll("_", " ")}
                  </span>
                </div>

                {/* Compact Tracking Line */}
                <div className="flex items-center justify-between relative">
                  {["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"]
                    .map((step, index, arr) => {
                      const isActive =
                        arr.indexOf(order.status) >= index;

                      return (
                        <div key={step} className="flex-1 text-center relative">
                          <div
                            className={`w-2.5 h-2.5 mx-auto rounded-full ${isActive ? "bg-orange-500" : "bg-gray-300"
                              }`}
                          />
                          <p className="text-[9px] mt-1 text-gray-500">
                            {step.replaceAll("_", " ")}
                          </p>
                        </div>
                      );
                    })}
                </div>

                {/* Restaurant + Address */}
                <div className="text-xs text-gray-600">
                  <p className="font-medium text-gray-800">
                    {order.restaurant?.name || "N/A"}
                  </p>
                  <p>
                    {order.address
                      ? `${order.address.address}, ${order.address.city}`
                      : "Address not available"}
                  </p>
                </div>

                {/* Items Compact With Image */}
                <div className="space-y-2 text-xs">
                  {order.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center"
                    >
                      {/* LEFT SIDE */}
                      <div className="flex items-center gap-2">

                        {/* Product Image */}
                        <div className="relative w-9 h-9 rounded-md overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                          <Image
                            src={
                              item.product?.image
                                ? getCloudinaryUrl(item.product.image, 200, 200)
                                : "/no-image.png"
                            }
                            alt={item.product?.name || "Product"}
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        </div>

                        {/* Name + Qty */}
                        <div className="leading-tight">
                          <p className="text-gray-800 font-medium text-xs">
                            {item.product?.name || "Item"}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>

                      {/* RIGHT SIDE (Price) */}
                      <span className="font-medium text-gray-700">
                        ₹{formatPrice(Number(item.price) * Number(item.quantity))}
                      </span>
                    </div>
                  ))}
                </div>


                {/* Total + Actions */}
                <div className="flex justify-between items-center border-t pt-2">

                  <div className="text-right space-y-1">
                    <p className="text-xs text-gray-500">
                      Subtotal: ₹{formatPrice(order.totalAmount || 0)}
                    </p>

                    <p className="text-xs text-gray-500">
                      Delivery:{" "}
                      {typeof order.deliveryCharge === "number" &&
                        order.deliveryCharge > 0
                        ? `₹${formatPrice(order.deliveryCharge)}`
                        : "FREE"}
                    </p>

                    {order.discount && order.discount > 0 && (
                      <p className="text-xs text-green-600">
                        Discount: -₹{formatPrice(order.discount)}
                      </p>
                    )}

                    <p className="font-semibold text-sm text-orange-600 border-t pt-1">
                      Total: ₹{formatPrice(order.finalAmount || 0)}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap">

                    {/* Retry */}
                    {order.paymentMethod === "ONLINE" &&
                      order.paymentStatus === "PENDING" &&
                      order.status !== "CANCELLED" && (
                        <button
                          onClick={() => retryPayment(order.id)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 text-xs rounded-lg transition"
                        >
                          Retry
                        </button>
                      )}

                    {/* Cancel */}
                    {(order.status === "PENDING" ||
                      order.status === "CONFIRMED") && (
                        <button
                          onClick={() => cancelOrder(order.id)}
                          disabled={processingId === order.id}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs rounded-lg disabled:opacity-50 transition"
                        >
                          {processingId === order.id
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>
                      )}

                    {/* Track */}
                    {order.status === "OUT_FOR_DELIVERY" && (
                      <button
                        onClick={() =>
                          router.push(`/user/track/${order.id}`)
                        }
                        className="bg-linear-to-r from-orange-500 to-orange-600 text-white px-3 py-1 text-xs rounded-lg shadow hover:shadow-md transition"
                      >
                        Track
                      </button>
                    )}

                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      </div >
    </>
  );
}
