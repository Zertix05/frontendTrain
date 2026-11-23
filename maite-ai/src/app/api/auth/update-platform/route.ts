import { NextRequest, NextResponse } from "next/server";
import { updateUserPlatformBySessionToken } from "../_store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const platform = typeof body?.platform === "string" ? body.platform : null;

    if (platform === null) {
      return NextResponse.json({ error: "INVALID_PLATFORM" }, { status: 400 });
    }

    const token = request.cookies.get("maite_session")?.value;
    const user = updateUserPlatformBySessionToken(token, platform);

    return NextResponse.json({ user });
  } catch (e) {
    const message = e instanceof Error ? e.message : "UNKNOWN";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
