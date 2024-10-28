import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import {
  isValidEmail,
  isValidPassword,
  validateCredentials,
} from "@/lib/utils/validation";
import { apiResponse, findUserByEmail, verifyPassword } from "@/lib/utils/api";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const validationError = validateCredentials(email, password);
    if (validationError) {
      return apiResponse(
        { message: validationError.error },
        validationError.status
      );
    }

    const user = await findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.password))) {
      return apiResponse({ message: "Invalid credentials" }, 401);
    }

    const { password: _, ...userWithoutPassword } = user;
    return apiResponse({
      message: "Login successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    return apiResponse({ message: "Server error: " + String(error) }, 500);
  }
}
