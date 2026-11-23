import { NextRequest, NextResponse } from "next/server";
import { createSession, verifyUser } from "../_store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email.trim() || !password) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const user = verifyUser({ email, password });
    const session = createSession(user.id);

    const res = NextResponse.json({ user });
    res.cookies.set({
      name: "maite_session",
      value: session.token,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : "UNKNOWN";
    const status = message === "INVALID_CREDENTIALS" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
