import { NextRequest, NextResponse } from "next/server";
import { createUser, createSession } from "../_store";

function normalizeApiUrl(url: string) {
  if (!url) return "";
  return url.endsWith("/") ? url : `${url}/`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fullName = typeof body?.name === "string" ? body.name : "";
    const emailAddress = typeof body?.email === "string" ? body.email : "";
    const phoneNumber = typeof body?.phoneNumber === "string" ? body.phoneNumber : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const pricingId = typeof body?.pricingId === "number" ? body.pricingId : undefined;
    const avatarId = typeof body?.avatarId === "number" ? body.avatarId : undefined;
    const platform = typeof body?.platform === "string" ? body.platform : undefined;

    console.log("📝 Registration request:", { fullName, emailAddress, phoneNumber, pricingId, avatarId, platform });

    if (!fullName.trim() || !emailAddress.trim() || !phoneNumber.trim() || !password) {
      console.log("❌ Validation failed");
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    // Отправляем данные на backend
    const apiUrl = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL || "");
    if (!apiUrl) {
      console.log("❌ API URL not configured");
      return NextResponse.json({ error: "API_URL_NOT_CONFIGURED" }, { status: 500 });
    }

    const backendUrl = `${apiUrl}v1/admin/users/`;
    console.log("🌐 Sending to backend:", backendUrl);

    const payload: Record<string, unknown> = {
      fullName,
      phoneNumber,
      emailAddress,
    };

    // Добавляем опциональные поля только если они определены
    if (avatarId !== undefined) payload.avatarId = avatarId;
    if (pricingId !== undefined) payload.pricingId = pricingId;
    if (platform !== undefined) payload.platform = platform;

    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    console.log("📡 Backend response status:", backendResponse.status);

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.log("❌ Backend error:", errorData);
      const errorMessage = errorData.error || errorData.message || "not correct data";
      return NextResponse.json(
        { error: errorMessage, details: errorData },
        { status: backendResponse.status }
      );
    }

    const backendData = await backendResponse.json();
    console.log("✅ Backend success:", backendData);

    // Сохраняем пользователя локально с паролем и ID от backend
    const user = createUser({
      id: backendData.id, // Используем ID от backend
      name: fullName,
      email: emailAddress,
      phoneNumber,
      password,
      pricingId,
      avatarId,
      platform,
      registration_link: backendData.registration_link,
    });

    // Создаем локальную сессию с backend ID
    const session = createSession(backendData.id);
    console.log("🔐 Created local user and session with backend ID:", backendData.id);

    // Возвращаем данные пользователя и registration_link (если есть)
    const responseData: { user: typeof user; registration_link?: string } = { user };

    if (backendData.registration_link) {
      responseData.registration_link = backendData.registration_link;
      console.log("🔗 Registration link from backend:", backendData.registration_link);
    }

    const res = NextResponse.json(responseData);

    // Сохраняем локальную сессию в cookie
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
    console.error("💥 Registration error:", e);
    const message = e instanceof Error ? e.message : "UNKNOWN";
    return NextResponse.json({ error: message, stack: e instanceof Error ? e.stack : undefined }, { status: 500 });
  }
}
