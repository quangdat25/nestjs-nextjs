import { cookies } from "next/headers";
import { backendUrl, readJson, tokenCookie } from "@/src/lib/server-api";

export async function POST(request: Request) {
  try {
    const response = await fetch(`${backendUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await request.text(),
      cache: "no-store",
    });
    const data = await readJson(response) as { access_token?: string; user?: unknown };
    if (!response.ok || !data.access_token) return Response.json(data, { status: response.status });
    (await cookies()).set(tokenCookie, data.access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return Response.json(data.user);
  } catch {
    return Response.json({ message: "Không thể kết nối máy chủ Bếp Mây" }, { status: 503 });
  }
}
