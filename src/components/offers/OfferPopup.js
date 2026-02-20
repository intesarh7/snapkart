import { useEffect, useState } from "react";

export default function OfferPopup() {
  const [offer, setOffer] = useState(null);
  const [show, setShow] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const popupShown = sessionStorage.getItem("offerPopupShown");
    if (popupShown) return;

    fetch("/api/admin/offers/public")
      .then(res => res.json())
      .then(data => {
        const popupOffer = data.find(o => o.isPopup);
        if (popupOffer) {
          setOffer(popupOffer);
          setShow(true);
          sessionStorage.setItem("offerPopupShown", "true");
        }
      });
  }, []);

  useEffect(() => {
    if (!offer?.expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(offer.expiresAt).getTime();
      const distance = expiry - now;

      if (distance <= 0) {
        setShow(false);
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [offer]);

  if (!show || !offer) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 relative">

        <button
          onClick={() => setShow(false)}
          className="absolute top-2 right-3"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-2">
          {offer.title}
        </h2>

        <p className="text-gray-600 mb-4">
          {offer.description}
        </p>

        <div className="text-2xl font-bold text-green-600 mb-3">
          {offer.type === "PERCENTAGE"
            ? `${offer.value}% OFF`
            : `₹ ${offer.value} OFF`}
        </div>

        {offer.expiresAt && (
          <div className="text-red-500 font-semibold">
            ⏳ Ends in: {timeLeft}
          </div>
        )}

      </div>
    </div>
  );
}
