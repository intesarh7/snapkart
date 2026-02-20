import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: "Latitude and Longitude required" });
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          "User-Agent": "snapkart-app",
          "Accept-Language": "en",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch location");
    }

    const data = await response.json();

    return res.status(200).json({
      address: data.display_name || "",
      pincode: data.address?.postcode || "",
      city:
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        "",
      state: data.address?.state || "",
      country: data.address?.country || "",
    });
  } catch (error) {
    console.error("Reverse Geocode Error:", error);
    return res.status(500).json({ message: "Error fetching location" });
  }
}
