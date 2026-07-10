import { cookies } from "next/headers";
import { tokenCookie } from "@/src/lib/server-api";

export async function POST() {
  (await cookies()).delete(tokenCookie);
  return Response.json({ success: true });
}
