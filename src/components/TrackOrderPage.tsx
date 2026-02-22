import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import "leaflet/dist/leaflet.css"
import Head from "next/head"
import { ArrowLeft } from "lucide-react"

interface TrackOrderPageProps {
    orderId: string
}

// 🔥 Load react-leaflet only on client
const MapContainer = dynamic(
    () => import("react-leaflet").then(m => m.MapContainer),
    { ssr: false }
)
const TileLayer = dynamic(
    () => import("react-leaflet").then(m => m.TileLayer),
    { ssr: false }
)
const Marker = dynamic(
    () => import("react-leaflet").then(m => m.Marker),
    { ssr: false }
)
const Polyline = dynamic(
    () => import("react-leaflet").then(m => m.Polyline),
    { ssr: false }
)

export default function TrackOrderPage({ orderId }: TrackOrderPageProps) {

    const router = useRouter()
    const { id } = router.query

    const [deliveryPos, setDeliveryPos] = useState<any>(null)
    const [route, setRoute] = useState<any[]>([])
    const [distance, setDistance] = useState(0)
    const [eta, setEta] = useState(0)
    const [icon, setIcon] = useState<any>(null)
    const [restaurantPos, setRestaurantPos] = useState<any>(null)
    const [customerPos, setCustomerPos] = useState<any>(null)

    const [showPopup, setShowPopup] = useState(false)

    // 🔥 Create icon ONLY on client
    useEffect(() => {
        if (typeof window !== "undefined") {
            const L = require("leaflet")

            const deliveryIcon = new L.Icon({
                iconUrl: "/delivery-bike.png",
                iconSize: [40, 60]
            })

            setIcon(deliveryIcon)
        }
    }, [])

    const handleBack = () => {
        if (router.pathname.startsWith("/admin")) {
            router.push("/admin/orders")
        } else if (router.pathname.startsWith("/user")) {
            router.push("/user/orders")
        } else {
            router.back()
        }
    }

    const fetchTracking = async () => {

        try {
            const res = await fetch(`/api/orders/track/${id}`)
            const data = await res.json()

            if (res.ok) {

                // 🔥 SAFE CHECK
                if (!data.deliveryLat || !data.deliveryLng) {
                    setShowPopup(true)
                    setDeliveryPos(null)
                    return
                } else {
                    setShowPopup(false)
                }

                const deliveryPos = [data.deliveryLat, data.deliveryLng]
                const restaurantPos = [data.restaurantLat, data.restaurantLng]
                const customerPos = [data.customerLat, data.customerLng]

                setDeliveryPos(deliveryPos)
                setRestaurantPos(restaurantPos)
                setCustomerPos(customerPos)

                // Route from restaurant to customer
                if (
                    data.restaurantLat &&
                    data.restaurantLng &&
                    data.customerLat &&
                    data.customerLng
                ) {

                    const sameLocation =
                        Math.abs(data.restaurantLat - data.customerLat) < 0.0001 &&
                        Math.abs(data.restaurantLng - data.customerLng) < 0.0001;

                    if (sameLocation) {
                        setRoute([]);
                        setDistance(0);
                        setEta(0);
                        return;
                    }

                    const routeRes = await fetch(
                        `/api/orders/route?startLat=${data.restaurantLat}&startLng=${data.restaurantLng}&endLat=${data.customerLat}&endLng=${data.customerLng}`
                    );

                    const routeData = await routeRes.json();

                    if (routeRes.ok && routeData.coordinates) {
                        const coords = routeData.coordinates.map((c: any) => [c[1], c[0]]);
                        setRoute(coords);
                        setDistance(routeData.distance / 1000);
                        setEta(routeData.duration / 60);
                    }
                } {

                    const routeRes = await fetch(
                        `/api/orders/route?startLat=${data.restaurantLat}&startLng=${data.restaurantLng}&endLat=${data.customerLat}&endLng=${data.customerLng}`
                    )

                    const routeData = await routeRes.json()

                    if (routeRes.ok && routeData.coordinates) {
                        const coords = routeData.coordinates.map((c: any) => [c[1], c[0]])
                        setRoute(coords)

                        setDistance(routeData.distance / 1000)
                        setEta(routeData.duration / 60)
                    }
                }
            }

        } catch (error) {
            setShowPopup(true)
        }
    }

    useEffect(() => {
        if (id) fetchTracking()
    }, [id])

    useEffect(() => {
        const interval = setInterval(fetchTracking, 5000)
        return () => clearInterval(interval)
    }, [id])

    if (!icon) {
        return <div className="p-6">Loading tracking...</div>
    }

    return (
        <>
            <Head>
                <title>Track Your Order Live | Real-Time Delivery Tracking – SnapKart</title>
                <meta name="description" content="Track your SnapKart order in real-time with live delivery updates, route tracking, estimated arrival time, and delivery partner location. Stay updated every step of the way." />
                <meta name="keywords" content="order tracking, live delivery tracking, food delivery tracking, real-time order status, SnapKart tracking, track food order online, delivery partner location" />
                {/* IMPORTANT for private tracking page */}
                <meta name="robots" content="noindex, nofollow" />
                {/* Open Graph (for sharing) */}
                <meta property="og:title" content="Track Your Order Live – SnapKart" />
                <meta property="og:description" content="Live track your order with real-time delivery updates and ETA." />
                <meta property="og:type" content="website" />
            </Head>
            {/* ===== Small Header Section ===== */}

<div className="mb-10">
                    <div className="bg-linear-to-r from-orange-500 to-orange-600 h-60 flex flex-col justify-end  py-8 px-6 text-center shadow-lg relative overflow-hidden">

                        {/* Soft background glow */}
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white,transparent_70%)]"></div>

                        <h1 className="text-2xl md:text-3xl font-bold text-white relative z-10">
                            Live Delivery Tracking
                        </h1>
                        <div className="mt-4 flex flex-col gap-2 items-center text-white text-sm">
                            <div>Distance Remaining: <strong>{distance.toFixed(2)} km</strong></div>
                            <div>ETA: <strong>{eta.toFixed(0)} min</strong></div>
                        </div>
                    </div>
                </div>
            <div className="p-6 max-w-6xl mx-auto relative">
                <div className="max-w-6xl mx-auto px-6 mt-6 bg-white shadow-lg  py-4 mb-5">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#FF6B00] transition"
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>
                </div>
                


                {/* 🔥 PROFESSIONAL POPUP */}
                {showPopup && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
                        <div className="bg-white shadow-xl rounded-2xl p-6 w-96 animate-fadeIn">
                            <div className="flex items-start gap-3">
                                <div className="text-blue-600 text-2xl">🚚</div>
                                <div>
                                    <p className="font-semibold text-gray-800 text-lg">
                                        Delivery in Progress
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Please try again. The delivery partner is on the way and location will update shortly.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}




                {/* 🔥 Only render map if deliveryPos exists */}
                {deliveryPos ? (
                    <MapContainer
                        center={deliveryPos}
                        zoom={14}
                        style={{ height: "500px", width: "100%" }}
                    >

                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {restaurantPos && <Marker position={restaurantPos} />}
                        {customerPos && <Marker position={customerPos} />}
                        {deliveryPos && icon && <Marker position={deliveryPos} icon={icon} />}
                        {route.length > 0 && <Polyline positions={route} color="blue" />}

                    </MapContainer>
                ) : (
                    <div className="h-125 flex items-center justify-center bg-gray-100 rounded-xl text-gray-500">
                        <div className="text-blue-600 text-xl">🚚</div> Waiting for delivery partner location...
                    </div>
                )}

            </div>
        </>
    )
}
