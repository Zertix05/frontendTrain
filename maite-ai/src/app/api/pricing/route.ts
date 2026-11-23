import { NextResponse } from "next/server";

function normalizeApiUrl(url: string) {
  if (!url) return "";
  return url.endsWith("/") ? url : `${url}/`;
}

export async function GET() {
  try {
    const apiUrl = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL || "");
    if (!apiUrl) {
      console.log("❌ API URL not configured");
      return NextResponse.json({ error: "API_URL_NOT_CONFIGURED" }, { status: 500 });
    }

    const backendUrl = `${apiUrl}v1/admin/pricing/`;
    console.log("🌐 Fetching pricing from backend:", backendUrl);

    const backendResponse = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    console.log("📡 Backend response status:", backendResponse.status);

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.log("❌ Backend error:", errorData);
      const errorMessage = errorData.error || errorData.message || "Failed to fetch pricing";
      return NextResponse.json(
        { error: errorMessage, details: errorData },
        { status: backendResponse.status }
      );
    }

    const pricingData = await backendResponse.json();

    return NextResponse.json(pricingData);
  } catch (e) {
    console.error("💥 Error fetching pricing:", e);
    const message = e instanceof Error ? e.message : "UNKNOWN";
    return NextResponse.json(
      { error: message, stack: e instanceof Error ? e.stack : undefined },
      { status: 500 }
    );
  }
}
