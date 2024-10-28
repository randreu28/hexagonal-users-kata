import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";

export default async function profileHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Get user ID from query or session
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await db
      .selectFrom("users")
      .where("id", "=", userId as any) // Type assertion to bypass type checking
      .select(["id", "email"]) // Only select necessary fields
      .executeTakeFirst();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: String(error) });
  }
}
