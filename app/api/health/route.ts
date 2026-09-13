import { checkDatabaseConn } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const isConnected = await checkDatabaseConn();
  if (isConnected) {
    return NextResponse.json(
      { status: "ok", message: "Database connection successful" },
      { status: 200 },
    );
  } else {
    return NextResponse.json(
      { status: "error", message: "Database connection error" },
      { status: 503 },
    );
  }
}
