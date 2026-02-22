import { useRouter } from "next/router"
import TrackOrderPage from "@/components/TrackOrderPage"

export default function AdminTrack() {
  const router = useRouter()
  const { id } = router.query

  if (!id || typeof id !== "string") return null

  return <TrackOrderPage orderId={id} />
}