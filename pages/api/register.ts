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

export default async function registerHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      message: "Please provide a valid email address",
    });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one underscore",
    });
  }

  try {
    const userExists = await db
      .selectFrom("users")
      .where("email", "=", email)
      .selectAll()
      .executeTakeFirst();

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db
      .insertInto("users")
      .values({
        email,
        password: hashedPassword,
      })
      .returning(["id", "email"]) // Return user data after insert
      .executeTakeFirst();

    res.status(201).json({
      message: "User created successfully",
      user: newUser,
      redirect: "/profile", // Add redirect path
    });
  } catch (error) {
    res.status(500).json({ message: String(error) });
  }
}
