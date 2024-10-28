import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";

export const findUserByEmail = async (email: string) => {
  return db
    .selectFrom("users")
    .where("email", "=", email)
    .selectAll()
    .executeTakeFirst();
};

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 10);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
) => {
  return bcrypt.compare(password, hashedPassword);
};

export const apiResponse = (data: any, status: number = 200) => {
  return NextResponse.json(data, { status });
};
