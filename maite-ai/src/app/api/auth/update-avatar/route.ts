import { NextRequest, NextResponse } from "next/server";
import { updateUserAvatarBySessionToken } from "../_store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const avatarId = typeof body?.avatarId === "number" ? body.avatarId : null;

    if (avatarId === null) {
      return NextResponse.json({ error: "INVALID_AVATAR_ID" }, { status: 400 });
    }

    const token = request.cookies.get("maite_session")?.value;
    const user = updateUserAvatarBySessionToken(token, avatarId);

    return NextResponse.json({ user });
  } catch (e) {
    const message = e instanceof Error ? e.message : "UNKNOWN";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
