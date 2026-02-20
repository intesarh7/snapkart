import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  Users,
  Store,
  ShoppingBag,
  Tag,
  Percent,
  Truck,
  CalendarDays,
  Star,
  FileText,
  Settings,
  Menu,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const router = useRouter();

  const menuItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: ShoppingBag,
    },
    {
      name: "Restaurants",
      href: "/admin/restaurants",
      icon: Store,
    },
    {
      name: "Users",
      icon: Users,
      subMenu: [
        { name: "Create User", href: "/admin/user", icon: Users },
      ],
    },
    {
      name: "Category",
      icon: Tag,
      subMenu: [
        { name: "Add Category", href: "/admin/category", icon: Tag },
        { name: "All Category", href: "/admin/category/unique", icon: Tag },
      ],
    },
    {
      name: "Products",
      icon: ShoppingBag,
      subMenu: [
        { name: "Add Product", href: "/admin/product", icon: ShoppingBag },
      ],
    },
    {
      name: "Offers",
      icon: Percent,
      subMenu: [
        { name: "Add Offers", href: "/admin/offers", icon: Percent },
        { name: "Special Offer", href: "/admin/special-offer", icon: Star },
      ],
    },
    {
      name: "Coupons",
      icon: Percent,
      subMenu: [
        { name: "Add Coupon", href: "/admin/coupons", icon: Percent },
      ],
    },
    {
      name: "Delivery",
      icon: Truck,
      subMenu: [
        { name: "Add Delivery Charge", href: "/admin/delivery", icon: Truck },
        { name: "Delivery Settings", href: "/admin/delivery-settings", icon: Settings },
      ],
    },
    {
      name: "Booking Settings",
      icon: CalendarDays,
      subMenu: [
        {
          name: "Booking Settings",
          href: "/admin/restaurants/booking-settings",
          icon: Settings,
        },
        { name: "Table Booking", href: "/admin/table-booking", icon: CalendarDays },
        { name: "Booking List", href: "/admin/bookings", icon: CalendarDays },
      ],
    },
    {
      name: "Featured",
      icon: Star,
      subMenu: [
        { name: "Add Featured", href: "/admin/featured", icon: Star },
      ],
    },
    {
      name: "Pages",
      icon: FileText,
      subMenu: [
        { name: "Add Pages", href: "/admin/pages", icon: FileText },
      ],
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-gray-900 text-white min-h-screen transition-all duration-300 flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && (
          <h2 className="text-xl font-bold tracking-wide">
            SnapKart
          </h2>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        {menuItems.map((item, index) => {
          const Icon = item.icon;

          // -------- Simple Menu --------
          if (!item.subMenu) {
            const isActive = router.pathname === item.href;

            return (
              <Link
                key={index}
                href={item.href!}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all
                ${
                  isActive
                    ? "bg-green-600 shadow-md"
                    : "hover:bg-gray-800"
                }`}
              >
                <Icon size={20} />
                {!collapsed && (
                  <span className="text-sm font-medium">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          }

          // -------- Menu With Submenu --------
          const isOpen = openMenu === item.name;

          return (
            <div key={index}>
              <button
                onClick={() =>
                  setOpenMenu(isOpen ? null : item.name)
                }
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-800 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} />
                  {!collapsed && (
                    <span className="text-sm font-medium">
                      {item.name}
                    </span>
                  )}
                </div>

                {!collapsed &&
                  (isOpen ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  ))}
              </button>

              {/* Submenu */}
              {!collapsed && isOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.subMenu.map((sub, subIndex) => {
                    const SubIcon = sub.icon;
                    const isActive =
                      router.pathname === sub.href;

                    return (
                      <Link
                        key={subIndex}
                        href={sub.href}
                        className={`flex items-center gap-2 p-2 rounded-md text-sm transition-all
                        ${
                          isActive
                            ? "bg-green-600 shadow"
                            : "hover:bg-gray-800"
                        }`}
                      >
                        <SubIcon size={16} />
                        {sub.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-700 text-xs text-gray-400 text-center">
          © {new Date().getFullYear()} SnapKart
        </div>
      )}
    </aside>
  );
}
