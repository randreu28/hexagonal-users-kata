import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import { isValidEmail, isValidPassword } from "@/lib/utils/validation";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        {
          message:
            "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one underscore",
        },
        { status: 400 }
      );
    }

    const userExists = await db
      .selectFrom("users")
      .where("email", "=", email)
      .selectAll()
      .executeTakeFirst();

    if (userExists) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db
      .insertInto("users")
      .values({
        email,
        password: hashedPassword,
      })
      .returning(["id", "email"])
      .executeTakeFirst();

    return NextResponse.json(
      {
        message: "User created successfully",
        user: newUser,
        redirect: "/profile",
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ message: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { email, password, newPassword } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!password || !newPassword) {
      return NextResponse.json(
        { message: "Password and new password are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    if (!isValidPassword(password) || !isValidPassword(newPassword)) {
      return NextResponse.json(
        {
          message:
            "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one underscore",
        },
        { status: 400 }
      );
    }

    if (password === newPassword) {
      return NextResponse.json(
        { message: "New password cannot be the same as the old password" },
        { status: 400 }
      );
    }

    const user = await db
      .selectFrom("users")
      .where("email", "=", email)
      .selectAll()
      .executeTakeFirst();

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db
      .updateTable("users")
      .set({
        password: hashedPassword,
      })
      .where("email", "=", email)
      .execute();

    return NextResponse.json({
      message: "Password changed successfully",
      redirect: "/login",
    });
  } catch (error) {
    return NextResponse.json({ message: String(error) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "", 10);

    if (!id) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await db
      .selectFrom("users")
      .where("id", "=", id)
      .select(["id", "email"])
      .executeTakeFirst();

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ message: String(error) }, { status: 500 });
  }
}
