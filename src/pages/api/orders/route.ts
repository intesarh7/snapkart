import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { startLat, startLng, endLat, endLng } = req.query;

    if (
      !startLat || !startLng ||
      !endLat || !endLng
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing coordinates",
      });
    }

    const sLat = Number(startLat);
    const sLng = Number(startLng);
    const eLat = Number(endLat);
    const eLng = Number(endLng);

    if (
      isNaN(sLat) || isNaN(sLng) ||
      isNaN(eLat) || isNaN(eLng)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates",
      });
    }

    // ✅ SAME LOCATION PROTECTION
    const sameLocation =
      Math.abs(sLat - eLat) < 0.0001 &&
      Math.abs(sLng - eLng) < 0.0001;

    if (sameLocation) {
      return res.status(200).json({
        success: true,
        coordinates: [],
        distance: 0,
        duration: 0,
      });
    }

    // 🔥 OSRM API CALL
    const osrmRes = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${sLng},${sLat};${eLng},${eLat}?overview=full&geometries=geojson`
    );

    if (!osrmRes.ok) {
      return res.status(400).json({
        success: false,
        message: "Routing service failed",
      });
    }

    const data = await osrmRes.json();

    if (!data.routes || data.routes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No route found",
      });
    }

    const route = data.routes[0];

    return res.status(200).json({
      success: true,
      coordinates: route.geometry.coordinates,
      distance: route.distance,
      duration: route.duration,
    });

  } catch (error) {
    console.error("Route API Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}