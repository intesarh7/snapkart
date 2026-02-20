import { useEffect, useState } from "react";

export default function CouponBanner() {
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    fetch("/api/coupons/public")
      .then(res => res.json())
      .then(setCoupons);
  }, []);

  if (!coupons.length) return null;

  return (
    <div className="bg-green-600 text-white py-2 text-center">
      {coupons.map((c) => (
        <span key={c.id} className="mx-4 font-semibold">
          🎁 {c.title} — Code: {c.code} —{" "}
          {c.type === "PERCENTAGE"
            ? `${c.value}% OFF`
            : `₹ ${c.value} OFF`}
        </span>
      ))}
    </div>
  );
}
