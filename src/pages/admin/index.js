import { prisma } from "@/lib/prisma";
import AdminLayout from "@/components/admin/AdminLayout";
import { Role, OrderStatus, PaymentStatus } from "@prisma/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
export default function AdminDashboard({
  stats,
  revenueData,
  recentOrders,
}) {
  return (
    <>
      <div className="p-6 space-y-8 bg-gray-50 min-h-screen">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500">
            Welcome to SnapKart Admin Panel
          </p>
        </div>

        {/* Top Revenue Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

          <StatCard title="Total Revenue" value={`₹ ${stats.totalRevenue}`} />
          <StatCard title="Today Revenue" value={`₹ ${stats.todayRevenue}`} />
          <StatCard title="Total Orders" value={stats.totalOrders} />
          <StatCard title="Cancelled Orders" value={stats.cancelledOrders} />

        </div>

        {/* Order Status Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">

          <MiniCard title="Pending" value={stats.pendingOrders} color="yellow" />
          <MiniCard title="Confirmed" value={stats.confirmedOrders} color="blue" />
          <MiniCard title="Preparing" value={stats.preparingOrders} color="orange" />
          <MiniCard title="Out for Delivery" value={stats.outOrders} color="purple" />
          <MiniCard title="Delivered" value={stats.deliveredOrders} color="green" />
          <MiniCard title="Cancelled" value={stats.cancelledOrders} color="red" />

        </div>

        {/* Users + Restaurant Stats */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

          <StatCard title="Total Users" value={stats.totalUsers} />
          <StatCard title="Delivery Boys" value={stats.totalDelivery} />
          <StatCard title="Restaurants" value={stats.totalRestaurants} />
          <StatCard title="Products" value={stats.totalProducts} />

        </div>

        {/* Booking & Coupon Stats */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

          <StatCard title="Bookings" value={stats.totalBookings} />
          <StatCard title="Active Coupons" value={stats.activeCoupons} />
          <StatCard title="Active Offers" value={stats.activeOffers} />
          <StatCard title="Special Offers" value={stats.specialOffers} />

        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Last 7 Days Revenue
          </h2>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#111827"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>


        {/* Recent Orders */}
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">
            Recent Orders
          </h2>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="py-2">Order</th>
                <th>User</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} className="border-b hover:bg-gray-50 transition">

                  <td className="py-3 font-medium">
                    #{order.orderNumber}
                  </td>

                  <td>{order.user.name}</td>

                  <td className="font-semibold">
                    ₹ {order.finalAmount}
                  </td>

                  <td>
                    <span className={`px-3 py-1 text-xs rounded-full ${order.status === "DELIVERED" ? "bg-green-100 text-green-700" :
                        order.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-700"
                      }`}>
                      {order.status}
                    </span>
                  </td>

                  <td>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
}



/* ================= SERVER SIDE ================= */

export async function getServerSideProps() {

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const totalRevenueAgg = await prisma.order.aggregate({
    where: { paymentStatus: PaymentStatus.PAID },
    _sum: { finalAmount: true },
  });

  const todayRevenueAgg = await prisma.order.aggregate({
    where: {
      paymentStatus: PaymentStatus.PAID,
      createdAt: { gte: todayStart }
    },
    _sum: { finalAmount: true },
  });

  const stats = {
    totalRevenue: totalRevenueAgg._sum.finalAmount || 0,
    todayRevenue: todayRevenueAgg._sum.finalAmount || 0,

    totalOrders: await prisma.order.count(),
    cancelledOrders: await prisma.order.count({
      where: { status: OrderStatus.CANCELLED }
    }),

    pendingOrders: await prisma.order.count({ where: { status: OrderStatus.PENDING } }),
    confirmedOrders: await prisma.order.count({ where: { status: OrderStatus.CONFIRMED } }),
    preparingOrders: await prisma.order.count({ where: { status: OrderStatus.PREPARING } }),
    outOrders: await prisma.order.count({ where: { status: OrderStatus.OUT_FOR_DELIVERY } }),
    deliveredOrders: await prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),

    totalUsers: await prisma.user.count({ where: { role: Role.USER } }),
    totalDelivery: await prisma.user.count({ where: { role: Role.DELIVERY } }),

    totalRestaurants: await prisma.restaurant.count(),
    totalProducts: await prisma.product.count(),

    totalBookings: await prisma.tableBooking.count(),

    activeCoupons: await prisma.coupon.count({ where: { isActive: true } }),
    activeOffers: await prisma.offer.count({ where: { isActive: true } }),
    specialOffers: await prisma.specialOffer.count({ where: { active: true } }),
  };

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      finalAmount: true,
      status: true,
      createdAt: true,
      user: {
        select: { name: true }
      }
    }
  });

  return {
    props: {
      stats,
      recentOrders: JSON.parse(JSON.stringify(recentOrders)),
    },
  };
}

/* ================= UI COMPONENTS ================= */

function StatCard({ title, value }) {
  return (
    <div className="bg-white shadow rounded-xl p-5 hover:shadow-lg transition">
      <h3 className="text-gray-500 text-sm">
        {title}
      </h3>
      <p className="text-2xl font-bold mt-2">
        {value}
      </p>
    </div>
  );
}

function MiniCard({ title, value, color }) {
  const colors = {
    yellow: "bg-yellow-100 text-yellow-700",
    blue: "bg-blue-100 text-blue-700",
    orange: "bg-orange-100 text-orange-700",
    purple: "bg-purple-100 text-purple-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <div className={`p-4 rounded-xl text-center ${colors[color]}`}>
      <p className="text-sm">{title}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}
