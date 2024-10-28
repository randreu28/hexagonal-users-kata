import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import {
  isValidEmail,
  isValidPassword,
  validateCredentials,
} from "@/lib/utils/validation";
import {
  apiResponse,
  findUserByEmail,
  hashPassword,
  verifyPassword,
} from "@/lib/utils/api";

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

    const userExists = await findUserByEmail(email);
    if (userExists) {
      return apiResponse({ message: "User already exists" }, 400);
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await db
      .insertInto("users")
      .values({ email, password: hashedPassword })
      .returning(["id", "email"])
      .executeTakeFirst();

    return apiResponse(
      {
        message: "User created successfully",
        user: newUser,
        redirect: "/profile",
      },
      201
    );
  } catch (error) {
    return apiResponse({ message: String(error) }, 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { email, password, newPassword } = await request.json();

    const validationError = validateCredentials(email, password);
    if (validationError) {
      return apiResponse(
        { message: validationError.error },
        validationError.status
      );
    }

    if (!newPassword) {
      return apiResponse({ message: "New password is required" }, 400);
    }

    const newPasswordValidation = validateCredentials(email, newPassword);
    if (newPasswordValidation) {
      return apiResponse(
        { message: newPasswordValidation.error },
        newPasswordValidation.status
      );
    }

    if (password === newPassword) {
      return apiResponse(
        { message: "New password cannot be the same as the old password" },
        400
      );
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return apiResponse({ message: "User not found" }, 400);
    }

    if (!(await verifyPassword(password, user.password))) {
      return apiResponse({ message: "Invalid password" }, 400);
    }

    const hashedPassword = await hashPassword(newPassword);
    await db
      .updateTable("users")
      .set({ password: hashedPassword })
      .where("email", "=", email)
      .execute();

    return apiResponse({
      message: "Password changed successfully",
      redirect: "/login",
    });
  } catch (error) {
    return apiResponse({ message: String(error) }, 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "", 10);

    if (!id) {
      return apiResponse({ message: "User ID is required" }, 400);
    }

    const user = await db
      .selectFrom("users")
      .where("id", "=", id)
      .select(["id", "email"])
      .executeTakeFirst();

    if (!user) {
      return apiResponse({ message: "User not found" }, 404);
    }

    return apiResponse({ user });
  } catch (error) {
    return apiResponse({ message: String(error) }, 500);
  }
}
