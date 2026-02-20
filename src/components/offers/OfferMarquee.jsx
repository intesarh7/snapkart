import { useEffect, useState } from "react";

export default function OfferMarquee() {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchOffers = async () => {
      try {
        const res = await fetch("/api/admin/offers/public", {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Failed to fetch offers");
        }

        const data = await res.json();

        const offersArray = Array.isArray(data.offers)
          ? data.offers
          : [];

        const now = new Date();

        const filtered = offersArray.filter((o) => {
          const notExpired =
            !o.expiresAt || new Date(o.expiresAt) > now;

          return o.isMarquee && o.isActive && notExpired;
        });

        setOffers(filtered);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Marquee fetch error:", err);
        }
        setOffers([]);
      }
    };

    fetchOffers();

    return () => controller.abort();
  }, []);

  if (!offers.length) return null;

  return (
    <div
      id="offer-marquee"
      className="fixed top-0 left-0 w-full z-50 bg-linear-to-r from-black via-gray-900 to-black text-white py-2 border-b border-gray-800 overflow-hidden"
    >
      <div className="flex whitespace-nowrap animate-marquee">
        {[...offers, ...offers].map((offer, index) => (
          <span
            key={`${offer.id}-${index}`}
            className="mx-10 flex items-center gap-2 font-medium text-sm tracking-wide"
          >
            <span className="text-yellow-400">🔥</span>

            <span className="font-semibold">
              {offer.title}
            </span>

            <span className="text-orange-400">
              {offer.type === "PERCENTAGE"
                ? `${offer.value}% OFF`
                : `₹${offer.value} OFF`}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
