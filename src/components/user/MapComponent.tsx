"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import "leaflet/dist/leaflet.css"

// Only dynamic components
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

// 🔥 Import hook normally (NOT dynamic)
import { useMapEvents } from "react-leaflet"

interface Props {
  onLocationSelect: (lat: number, lng: number) => void
}

function LocationMarker({ onLocationSelect }: Props) {
  const [position, setPosition] = useState<any>(null)

  useMapEvents({
    click(e: any) {
      setPosition(e.latlng)
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    }
  })

  return position ? <Marker position={position} /> : null
}

export default function MapComponent({ onLocationSelect }: Props) {

  useEffect(() => {
    if (typeof window !== "undefined") {
      const L = require("leaflet")

      delete L.Icon.Default.prototype._getIconUrl

     L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
})
    }
  }, [])

  return (
    <MapContainer
      center={[28.6139, 77.209]}
      zoom={13}
      style={{ height: "300px", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker onLocationSelect={onLocationSelect} />
    </MapContainer>
  )
}
