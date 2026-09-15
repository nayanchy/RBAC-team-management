import { checkUserPermission, getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Role } from "@/app/types";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await context.params;
    const user = await getCurrentUser();

    if (!user || !checkUserPermission(user, Role.ADMIN)) {
      return NextResponse.json(
        {
          error: "You are not authorized to perform this action",
        },
        { status: 401 },
      );
    }

    if (userId === user.id) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 401 },
      );
    }
    const { role } = await request.json();

    //   Validate role
    const validRole = [Role.USER, Role.MANAGER];

    if (!validRole.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role },
      include: { team: true },
    });

    return NextResponse.json({
      user: updatedUser,
      message: "User role updated successfully",
    });
  } catch (err) {
    console.error(err);
    if (
      err instanceof Error &&
      err.message.includes("Record to update not found")
    ) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
}
