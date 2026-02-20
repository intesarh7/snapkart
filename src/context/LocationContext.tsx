"use client";

import {
  createContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type LocationType = {
  location: string;       // formatted lat/lng string
  locationName?: string;  // area name
  lat?: number;
  lng?: number;
};

export const LocationContext = createContext<LocationType>({
  location: "",
});

export function LocationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [locationData, setLocationData] =
    useState<LocationType>({
      location: "",
    });

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!navigator.geolocation) {
      setLocationData({
        location: "Not Supported",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const formattedLatLng = `Lat: ${lat.toFixed(
          2
        )}, Lng: ${lng.toFixed(2)}`;

        try {
          // Reverse Geocode (Free OpenStreetMap)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );

          const data = await res.json();

          

            const areaName =
            data.address.village ||
            data.address.hamlet ||
            data.address.suburb ||
            data.address.town ||
            data.address.city ||
            data.address.municipality ||
            data.address.county ||
            data.address.state_district ||
            data.address.state ||
            "Unknown Area";

          setLocationData({
            location: formattedLatLng,
            locationName: areaName,
            lat,
            lng,
          });
        } catch {
          setLocationData({
            location: formattedLatLng,
            lat,
            lng,
          });
        }
      },
      () =>
        setLocationData({
          location: "Permission Denied",
        })
    );
  }, []);

  return (
    <LocationContext.Provider value={locationData}>
      {children}
    </LocationContext.Provider>
  );
}
