import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";

export default async function profileHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const id = parseInt(req.query.id as string, 10);

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await db
      .selectFrom("users")
      .where("id", "=", id)
      .select(["id", "email"])
      .executeTakeFirst();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: String(error) });
  }
}
