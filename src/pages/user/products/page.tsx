"use client";

import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import { CartContext } from "@/context/CartContext";
import toast from "react-hot-toast";

export default function ProductDetails() {
  const router = useRouter();
  const { id } = router.query;

  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/user/products/${id}`)
      .then(res => res.json())
      .then(setProduct);
  }, [id]);

  if (!product) return null;

  return (
    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">

      <img
        src={product.image}
        className="rounded-xl w-full"
      />

      <div>
        <h1 className="text-3xl font-bold">
          {product.name}
        </h1>

        <p className="text-gray-500 mt-2">
          {product.description}
        </p>

        <p className="text-2xl font-bold mt-4">
          ₹ {product.price}
        </p>

        <button
          onClick={() => {
            addToCart(product);
            toast.success("Item added 🛒");
          }}
          className="mt-6 bg-black text-white px-6 py-3 rounded"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
