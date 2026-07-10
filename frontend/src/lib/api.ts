export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api/backend/${path.replace(/^\//, "")}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    cache: "no-store",
  });
  const data = await response.json().catch(() => null) as { message?: string | string[] } | T | null;
  if (!response.ok) {
    const rawMessage = data && typeof data === "object" && "message" in data ? data.message : undefined;
    const message = Array.isArray(rawMessage) ? rawMessage[0] : rawMessage;
    throw new ApiError(message ?? "Có lỗi xảy ra, vui lòng thử lại.", response.status);
  }
  return data as T;
}

export const formatMoney = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
