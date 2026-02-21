import { useContext } from "react";
import { CartContext } from "@/context/CartContext";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { getCloudinaryUrl } from "@/lib/cloudinary-url";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: Props) {
  const { cartItems, increaseQty, decreaseQty, removeFromCart, updateCartItem } = useContext(CartContext);
  const pathname = usePathname();
  const router = useRouter();
  const { isCartOpen, setIsCartOpen } = useContext(CartContext);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const { isLoggedIn } = useAuth();
  const formatPrice = (amount: number) => {
    return Math.round(Number(amount || 0));
  };

  const total = cartItems.reduce((sum, item) => {
    return sum + (item.finalPrice || item.price) * item.quantity;
  }, 0);


  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [pathname]);

  useEffect(() => {
    if (!editingItem) return;

    const latest = cartItems.find(
      (item) => item.cartKey === editingItem.cartKey
    );

    if (latest && latest !== editingItem) {
      setEditingItem(latest);
    }
  }, [cartItems]);



  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className="fixed right-0 top-0 w-full max-w-md h-full bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b bg-linear-to-r from-[#FF6B00] to-[#FF6B00] text-white">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} />
                <h2 className="text-lg font-semibold">
                  Your Cart
                </h2>
              </div>

              <X
                onClick={onClose}
                className="cursor-pointer hover:scale-110 transition"
              />
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              <>
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                    <ShoppingBag size={40} className="mb-3 opacity-40" />
                    Your cart is empty
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.cartKey}
                      className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center relative hover:shadow-md transition"
                    >
                      {/* Remove Button */}
                      <button
                        onClick={() => {
                          removeFromCart(item.cartKey!);
                          toast.success("Item removed");
                        }}
                        className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition"
                      >
                        <X size={16} />
                      </button>

                      {/* Item Info */}
                      <div className="flex gap-4 items-center w-full">
                        {/* Product Image */}
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                          <Image
                            src={
                              item.image
                                ? getCloudinaryUrl(item.image, 300, 300)
                                : "/placeholder.jpg"
                            }
                            alt={item.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                        <h3 className="font-medium text-gray-800 text-sm leading-tight">
                          {item.name}
                        </h3>

                        {item.variants && item.variants.length > 0 && (
                          <p
                            className="text-xs text-gray-500 mt-1 cursor-pointer hover:text-[#FF6B00]"
                            onClick={() => setEditingItem(item)}
                          >
                            Size:{" "}
                            <span className="font-medium">{item.variantName}</span> (Change)
                          </p>
                        )}

                        {item.availableExtras && item.availableExtras.length > 0 && (
                          <div
                            className="text-xs text-gray-500 mt-1 space-y-1 cursor-pointer hover:text-[#FF6B00]"
                            onClick={() => setEditingItem(item)}
                          >
                            {item.extras?.map((ex: any) => (
                              <p key={ex.id}>
                                + {ex.name} (₹{formatPrice(ex.price)})
                              </p>
                            ))}
                            <p className="text-[11px] text-blue-500">Edit Extras</p>
                          </div>
                        )}

                        <p className="text-xs text-gray-400 mt-1">
                          Qty: {item.quantity}
                        </p>

                        <p className="text-sm text-[#FF6B00] font-semibold mt-1">
                          ₹ {formatPrice((item.finalPrice || item.price) * item.quantity)}
                        </p>
                      </div>
</div>
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-blue-50 px-2 py-1 rounded-xl">
                        <button
                          onClick={() => decreaseQty(item.cartKey!)}
                          className="p-1 rounded-md hover:bg-blue-100 transition"
                        >
                          <Minus size={16} />
                        </button>

                        <span className="w-5 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => increaseQty(item.cartKey!)}
                          className="p-1 rounded-md hover:bg-blue-100 transition"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {editingItem && (

                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">

                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 max-h-[85vh] overflow-y-auto relative animate-fadeIn">

                      {/* Close Button */}
                      <button
                        onClick={() => setEditingItem(null)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-black text-lg"
                      >
                        ✕
                      </button>

                      <h3 className="text-xl font-semibold mb-6 text-center">
                        Customize {editingItem.name}
                      </h3>
                      {(!editingItem.variants || editingItem.variants.length === 0) &&
                        (!editingItem.availableExtras || editingItem.availableExtras.length === 0) && (
                          <p className="text-sm text-gray-500">
                            No customization available for this item.
                          </p>

                        )}

                      {/* VARIANTS */}
                      {Array.isArray(editingItem?.variants) &&
                        editingItem.variants.length > 0 && (
                          <>
                            <h4 className="text-sm font-medium mb-2">
                              Select Size
                            </h4>
                            <div className="space-y-2 mb-4">
                              {editingItem.variants.map((v: any) => {
                                const isSelected = editingItem.variantId === v.id;

                                return (
                                  <div
                                    key={v.id}
                                    onClick={() => {
                                      const updatedData = {
                                        variantId: v.id,
                                        variantName: v.name,
                                        price: v.price,
                                        finalPrice:
                                          (v.finalPrice || v.price) +
                                          (editingItem.extras
                                            ? editingItem.extras.reduce((sum: number, ex: any) => sum + ex.price, 0)
                                            : 0),
                                      };

                                      // update cart
                                      updateCartItem(editingItem.cartKey!, updatedData);

                                      // update local instantly (important)
                                      setEditingItem((prev: any) => ({
                                        ...prev,
                                        ...updatedData,
                                      }));
                                    }}
                                    className={`flex justify-between rounded-lg p-3 cursor-pointer transition border
                                        ${isSelected
                                        ? "border-[#FF6B00] bg-orange-50 ring-2 ring-[#FF6B00]"
                                        : "border-gray-200 hover:border-[#FF6B00]"
                                      }
                                      `}
                                  >
                                    <span className="font-medium">{v.name}</span>
                                    <span className="font-semibold">
                                      ₹{formatPrice(v.price)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}

                      {/* EXTRAS */}
                      {Array.isArray(editingItem?.availableExtras) &&
                        editingItem.availableExtras.length > 0 && (
                          <>
                            <h4 className="text-sm font-medium mb-2">
                              Add-ons
                            </h4>
                            <div className="space-y-2">
                              {editingItem.availableExtras.map((ex: any) => {
                                const isChecked = editingItem.extras?.some(
                                  (e: any) => Number(e.id) === Number(ex.id)
                                );

                                return (
                                  <label
                                    key={ex.id}
                                    className={`flex justify-between rounded-lg p-3 cursor-pointer transition border
        ${isChecked
                                        ? "border-[#FF6B00] bg-orange-50"
                                        : "border-gray-200 hover:border-[#FF6B00]"}
      `}
                                  >
                                    <div className="flex gap-2 items-center">
                                      <input
                                        type="checkbox"
                                        checked={editingItem.extras?.some(
                                          (e: any) => Number(e.id) === Number(ex.id)
                                        )}
                                        onChange={(e) => {
                                          let updatedExtras = [];

                                          if (e.target.checked) {
                                            updatedExtras = [
                                              ...(editingItem.extras || []),
                                              ex,
                                            ];
                                          } else {
                                            updatedExtras =
                                              editingItem.extras?.filter(
                                                (item: any) =>
                                                  Number(item.id) !== Number(ex.id)
                                              ) || [];
                                          }

                                          // update cart
                                          const variantBasePrice =
                                            editingItem.variantPrice ||
                                            editingItem.price;

                                          const newFinalPrice =
                                            variantBasePrice +
                                            updatedExtras.reduce((sum: number, ex: any) => sum + ex.price, 0);

                                          updateCartItem(editingItem.cartKey!, {
                                            extras: updatedExtras,
                                            finalPrice: newFinalPrice,
                                          });

                                          // update local instantly
                                          setEditingItem((prev: any) => ({
                                            ...prev,
                                            extras: updatedExtras,
                                          }));
                                        }}
                                        className="accent-[#FF6B00]"
                                      />
                                      <span>{ex.name}</span>
                                    </div>

                                    <span className="font-medium">
                                      ₹{formatPrice(ex.price)}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </>
                        )}

                      <button
                        onClick={() => setEditingItem(null)}
                        className="mt-6 w-full bg-[#FF6B00] text-white py-3 rounded-xl"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </>
            </div>

            {/* Footer */}
            <div className="border-t bg-white p-6 space-y-4">
              <div className="flex justify-between text-gray-700 font-medium">
                <span>Total</span>
                <span className="text-lg font-bold text-[#FF6B00]">
                  ₹ {formatPrice(total)}
                </span>
              </div>

              <button
                onClick={() => {
                  if (cartItems.length === 0) {
                    toast.error("Your cart is empty");
                    return;
                  }
                  onClose();
                  if (isLoggedIn) {
                    router.push("/user/checkout");
                  } else {
                    toast("Please login to continue");
                    router.push("/login?redirect=/user/checkout");
                  }
                }}
                className="w-full bg-linear-to-r from-[#FF6B00] to-[#FF6B00] hover:bg-[#d15801] text-white py-3 rounded-2xl font-semibold shadow-md transition-all duration-300 hover:shadow-lg active:scale-95"
              >
                Proceed to Checkout
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
