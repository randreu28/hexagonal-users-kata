import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";

function isValidPassword(password: string): boolean {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*_)[a-zA-Z\d_]{6,}$/;
  return passwordRegex.test(password);
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default async function changePasswordHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password, newPassword } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (!password || !newPassword) {
    return res
      .status(400)
      .json({ message: "Password and new password are required" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      message: "Please provide a valid email address",
    });
  }

  if (!isValidPassword(password) || !isValidPassword(newPassword)) {
    return res.status(400).json({
      message:
        "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one underscore",
    });
  }

  if (password === newPassword) {
    return res
      .status(400)
      .json({ message: "New password cannot be the same as the old password" });
  }

  try {
    const user = await db
      .selectFrom("users")
      .where("email", "=", email)
      .selectAll()
      .executeTakeFirst();

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db
      .updateTable("users")
      .set({
        password: hashedPassword,
      })
      .where("email", "=", email)
      .execute();

    // Return success with redirect flag
    res.status(200).json({
      message: "Password changed successfully",
      redirect: "/login",
    });
  } catch (error) {
    res.status(500).json({ message: String(error) });
  }
}
