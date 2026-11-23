import { NextRequest, NextResponse } from "next/server";
import { renewSubscriptionBySessionToken, updateUserPlanBySessionToken } from "../_store";

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get("maite_session")?.value;
    const body = await request.json();
    const pricingId = Number(body?.pricingId);

    if (!Number.isFinite(pricingId) || pricingId < 1 || pricingId > 3) {
      return NextResponse.json({ error: "INVALID_PLAN" }, { status: 400 });
    }

    const user = updateUserPlanBySessionToken(token, pricingId);
    return NextResponse.json({ user });
  } catch (e) {
    const message = e instanceof Error ? e.message : "UNKNOWN";
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("maite_session")?.value;
    const body = await request.json();
    const days = Number(body?.days);

    if (!Number.isFinite(days) || days <= 0 || days > 365) {
      return NextResponse.json({ error: "INVALID_DAYS" }, { status: 400 });
    }

    const user = renewSubscriptionBySessionToken(token, days);
    return NextResponse.json({ user });
  } catch (e) {
    const message = e instanceof Error ? e.message : "UNKNOWN";
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
