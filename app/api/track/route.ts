import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // For now: accept & log.
    // Next step: insert into Supabase when configured.
    console.log("[Analytics]", body);

    return NextResponse.json({ ok: true, received: !!body });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
