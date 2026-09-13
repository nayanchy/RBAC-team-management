import { generateToken, hashPassword } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, teamCode } = await request.json();

    // Validating the input data
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required or not valid" },
        { status: 400 },
      );
    }

    // Find if the user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "The user already exists with the same email" },
        { status: 409 },
      );
    }

    // Check the team
    let teamId: string | undefined;

    if (teamCode) {
      const team = await prisma.team.findUnique({
        where: { code: teamCode },
      });

      if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 400 });
      }

      teamId = team.id;
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // First user becomes ADMIN and the rest become USER

    const userCount = await prisma.user.count();
    const role = userCount === 0 ? Role.ADMIN : Role.USER;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        teamId,
      },
      include: {
        team: true,
      },
    });

    //  Generate Token
    const token = await generateToken(user.id);

    // Create Response
    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        emai: user.email,
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
  } catch (error) {
    console.error("Failed to register user:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 },
    );
  }
}
