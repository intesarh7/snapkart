import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const { startLat, startLng, endLat, endLng } = req.query

  try {

    const response = await fetch(
      "https://api.openrouteservice.org/v2/directions/driving-car",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": process.env.ORS_API_KEY as string
        },
        body: JSON.stringify({
          coordinates: [
            [Number(startLng), Number(startLat)],
            [Number(endLng), Number(endLat)]
          ]
        })
      }
    )

    const data = await response.json()

    if (!data.features || data.features.length === 0) {
    return res.status(400).json({
        message: "Route not found"
    })
    }

    const route = data.features[0]

    return res.status(200).json({
      coordinates: route.geometry.coordinates,
      distance: route.properties.summary.distance,
      duration: route.properties.summary.duration
    })

  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Route error" })
  }
}
