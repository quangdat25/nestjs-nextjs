export const backendUrl =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8080/api/v1";

export const tokenCookie = "bepmay_token";

export async function readJson(response: Response) {
  return response.json().catch(() => ({ message: "Backend không phản hồi đúng định dạng" }));
}
