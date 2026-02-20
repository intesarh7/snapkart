import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/* ---- Load Map only on client ---- */

const Map = dynamic(
  () => import("./MapComponent"),
  { ssr: false }
);

interface Props {
  onLocationSelect: (lat: number, lng: number) => void;
}

export default function LocationPicker({ onLocationSelect }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <Map onLocationSelect={onLocationSelect} />;
}
