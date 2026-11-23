import { NextRequest, NextResponse } from "next/server";
import { updateUserPricingBySessionToken } from "../_store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const pricingId = typeof body?.pricingId === "number" ? body.pricingId : null;

    if (pricingId === null) {
      return NextResponse.json({ error: "INVALID_PRICING_ID" }, { status: 400 });
    }

    const token = request.cookies.get("maite_session")?.value;
    const user = updateUserPricingBySessionToken(token, pricingId);

    return NextResponse.json({ user });
  } catch (e) {
    const message = e instanceof Error ? e.message : "UNKNOWN";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
