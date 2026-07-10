import { cookies } from "next/headers";
import { backendUrl, readJson, tokenCookie } from "@/src/lib/server-api";

export async function GET() {
  const store = await cookies();
  const token = store.get(tokenCookie)?.value;
  if (!token) return Response.json({ user: null });
  try {
    const response = await fetch(`${backendUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) {
      store.delete(tokenCookie);
      return Response.json({ user: null });
    }
    return Response.json({ user: await readJson(response) });
  } catch {
    return Response.json({ user: null }, { status: 503 });
  }
}
