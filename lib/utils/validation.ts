export function isValidPassword(password: string): boolean {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*_)[a-zA-Z\d_]{6,}$/;
  return passwordRegex.test(password);
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateCredentials(
  email?: string,
  password?: string
): { error: string; status: number } | null {
  if (!email || !password) {
    return { error: "Email and password are required", status: 400 };
  }

  if (!isValidEmail(email)) {
    return { error: "Please provide a valid email address", status: 400 };
  }

  if (!isValidPassword(password)) {
    return {
      error:
        "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one underscore",
      status: 400,
    };
  }

  return null;
}
