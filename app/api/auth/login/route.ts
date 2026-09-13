import { generateToken, verifyPassword } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validating the input data
    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Email and password are required or not valid",
        },
        { status: 400 },
      );
    }

    // Find if the user exists
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        team: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Check if the password is correct
    const isPasswordCorrect = await verifyPassword(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Generate Token if the password is correct
    const token = generateToken(user.id);

    const response = NextResponse.json({
      message: "Login Successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
        team: user.team,
        token,
      },
    });

    // Set cookies
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error(`Error in login: ${err}`);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
