import { useEffect } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Seo from "@/components/Seo";

export default function PaymentSuccess() {
  const router = useRouter();
  const { query } = useRouter();
  const orderNumber = query.orderNumber;

  useEffect(() => {
    const confirmBooking = async () => {
      try {
        const res = await fetch("/api/user/confirm-booking-payment", {
          method: "POST",
        });

        if (!res.ok) {
          toast.error("Payment verification failed");
          return;
        }

        toast.success("Booking confirmed 🎉");

        setTimeout(() => {
          router.push("/user/booked-tables");
        }, 2500);

      } catch (err) {
        toast.error("Something went wrong");
      }
    };

    confirmBooking();
  }, []);

  return (
    <>
<Seo
      title={`Payment Successful - Order #${orderNumber} | SnapKart`}
      description="Your payment has been successfully processed. Thank you for ordering with SnapKart."
      url="https://yourdomain.com/user/payment-success"
    />
    {/* ===== Small Header Section ===== */}
      <div className="mb-10">
        <div className="bg-linear-to-r from-orange-500 to-orange-600 h-60 flex flex-col justify-end  py-8 px-6 text-center shadow-lg relative overflow-hidden">
          
          {/* Soft background glow */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white,transparent_70%)]"></div>

          <h1 className="text-2xl md:text-3xl font-bold text-white relative z-10">
           Thank you 🎉
          </h1>
        </div>
      </div>
    <div className="h-96 flex items-center justify-center bg-gray-50">
      
      <div className="bg-white p-10 rounded-2xl shadow text-center">
        <h1 className="text-2xl font-bold text-green-600">
          Payment Successful 🎉
        </h1>
        <p className="mt-3 text-gray-500">
          Confirming your booking...
        </p>
      </div>
    </div>
    </>
  );
}
