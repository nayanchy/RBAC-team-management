import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Role } from "@/app/types";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "You are not authorized to access user information",
        },
        {
          status: 401,
        },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const teamId = searchParams.get("teamId");
    const role = searchParams.get("role");

    // ধাপ ১: RBAC ভিত্তিক শর্ত আলাদা ভ্যারিয়েবলে - এটা কখনো override হবে না
    let roleBasedWhere: Prisma.UserWhereInput = {};

    if (user.role === Role.ADMIN) {
      // Admin can see all users
      roleBasedWhere = {};
    } else if (user.role === Role.MANAGER) {
      // Manager can only see users in their team and cross team users but not cross team managers
      roleBasedWhere = {
        OR: [{ teamId: user.teamId }, { role: Role.USER }],
      };
    } else {
      // Regular users can only see Users in their team
      roleBasedWhere = {
        teamId: user.teamId,
        role: { not: Role.ADMIN },
      };
    }

    // ধাপ ২: Query param filters আলাদাভাবে (validate করে)
    const queryFilters: Prisma.UserWhereInput[] = [];

    if (teamId) {
      queryFilters.push({ teamId });
    }

    if (role) {
      if (!Object.values(Role).includes(role as Role)) {
        return NextResponse.json(
          { error: "Invalid role value" },
          { status: 400 },
        );
      }
      queryFilters.push({ role: role as Role });
    }

    // ধাপ ৩: RBAC + query filters কে AND দিয়ে জোড়া - কেউ কাউকে override করতে পারবে না
    const where: Prisma.UserWhereInput = {
      AND: [roleBasedWhere, ...queryFilters],
    };

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (err) {
    console.error(err);
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
