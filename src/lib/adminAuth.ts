import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export function verifyAdmin(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.cookies.snapkart_token;

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
    return null;
  }

  try {
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    if (decoded.role !== "ADMIN") {
      res.status(403).json({
        success: false,
        message: "Access denied",
      });
      return null;
    }

    return decoded;
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
    return null;
  }
}
