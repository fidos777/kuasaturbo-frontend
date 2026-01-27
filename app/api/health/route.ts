import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "kuasaturbo",
    env: process.env.NEXT_PUBLIC_DEPLOY_MODE || "unknown",
  });
}

