import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader(
    "Set-Cookie",
    serialize("snapkart_token", "", {
      httpOnly: true,
      path: "/",
      expires: new Date(0),
    })
  );

  res.status(200).json({ message: "Logged out" });
}
