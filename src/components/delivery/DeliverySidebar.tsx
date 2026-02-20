import Link from "next/link";
import { Package, MapPin, User } from "lucide-react";

export default function DeliverySidebar() {
  return (
    <div className="w-64 bg-black text-white p-6 space-y-6">
      <h2 className="text-xl font-bold">Delivery Panel</h2>

      <nav className="space-y-4">
        <Link href="/delivery/dashboard" className="flex gap-2">
          <Package size={18} /> Orders
        </Link>

        <Link href="/delivery/earnings" className="flex gap-2">
          <Package size={18} /> Earnings
        </Link>

        <Link href="/delivery/profile" className="flex gap-2">
          <User size={18} /> Profile
        </Link>
      </nav>
    </div>
  );
}
