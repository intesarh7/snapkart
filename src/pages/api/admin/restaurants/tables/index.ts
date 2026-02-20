import type { NextApiRequest, NextApiResponse } from "next";
import create from "./create";
import update from "./update";
import remove from "./delete";
import get from "./get";
import list from "./list";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "POST":
      return create(req, res);

    case "PUT":
      return update(req, res);

    case "DELETE":
      return remove(req, res);

    case "GET":
      if (req.query.id) {
        return get(req, res);
      }
      return list(req, res);

    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}
