import { NextRequest, NextResponse } from "next/server";
import { getUserBySessionToken } from "../_store";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("maite_session")?.value;
  const user = getUserBySessionToken(token);
  return NextResponse.json({ user });
}
