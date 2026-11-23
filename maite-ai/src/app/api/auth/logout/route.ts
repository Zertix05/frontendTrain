import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "../_store";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("maite_session")?.value;
  deleteSession(token);

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: "maite_session",
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}
